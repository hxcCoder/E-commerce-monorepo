/**
 * Integration Tests - Full Order Workflow
 * Tests the complete flow from order creation to fulfillment
 */

import { CreateOrder } from '../CreateOrder';
import { RequestOrderPayment } from '../RequestOrderPayment';
import { ConfirmPayment } from '../ConfirmPayment';
import { FulfillOrder } from '../FulfillOrder';
import { InMemoryOrderRepository } from './fakes/InMemoryOrderRepository';
import { InMemoryEventPublisher } from './fakes/InMemoryEventPublisher';
import { PaymentResult } from '../../../entities/payment/PaymentResult';
import { PaymentStatus } from '../../../entities/payment/PaymentStatus';
import { OrderStatus } from '../../../entities/order/OrderStatus';
import { OrderAlreadyFinalizedError } from '../../../entities/order/OrderErrors';

describe('Order Workflow Integration', () => {
  let repository: InMemoryOrderRepository;
  let publisher: InMemoryEventPublisher;
  let createOrder: CreateOrder;
  let requestPayment: RequestOrderPayment;
  let confirmPayment: ConfirmPayment;
  let fulfillOrder: FulfillOrder;

  beforeEach(() => {
    repository = new InMemoryOrderRepository();
    publisher = new InMemoryEventPublisher();
    createOrder = new CreateOrder(repository, publisher);
    requestPayment = new RequestOrderPayment(repository, publisher);
    confirmPayment = new ConfirmPayment(repository, publisher);
    fulfillOrder = new FulfillOrder(repository, publisher);
  });

  it('should complete a full successful order workflow', async () => {
    // Step 1: Create order
    const items = [
      { productId: 'p1', quantity: 2, unitPrice: 50 },
      { productId: 'p2', quantity: 1, unitPrice: 100 },
    ];
    const order = await createOrder.execute(items);
    
    expect(order.id).toBeDefined();
    expect(order.getTotalAmount()).toBe(200); // 2*50 + 1*100
    expect(publisher.events.length).toBe(1);
    
    const [createEvent] = publisher.events;
    expect((createEvent as any).constructor.name).toBe('OrderCreated');
    expect((createEvent as any).orderId).toBe(order.id);

    // Step 2: Request payment
    publisher.events = [];
    await requestPayment.execute(order.id);
    
    const savedOrder = await repository.findById(order.id);
    expect(savedOrder!.getStatus().toString()).toBe(OrderStatus.PaymentPending);
    expect(publisher.events.length).toBe(1);

    // Step 3: Confirm payment
    publisher.events = [];
    const paymentResult = new PaymentResult({
      status: PaymentStatus.APPROVED,
      providerReference: 'ch_123456',
      receivedAt: new Date(),
    });
    await confirmPayment.execute(order.id, paymentResult);
    
    const paidOrder = await repository.findById(order.id);
    expect(paidOrder!.getStatus().toString()).toBe(OrderStatus.Paid);
    expect(publisher.events.length).toBe(1);

    // Step 4: Fulfill order
    publisher.events = [];
    await fulfillOrder.execute(order.id);
    
    const fulfilledOrder = await repository.findById(order.id);
    expect(fulfilledOrder!.getStatus().toString()).toBe(OrderStatus.Fulfilled);
    expect(publisher.events.length).toBe(1);
  });

  it('should handle payment rejection in the workflow', async () => {
    const order = await createOrder.execute([
      { productId: 'p1', quantity: 1, unitPrice: 100 },
    ]);
    
    await requestPayment.execute(order.id);
    
    publisher.events = [];
    const paymentResult = new PaymentResult({
      status: PaymentStatus.REJECTED,
      providerReference: 'ch_failed',
      receivedAt: new Date(),
    });
    await confirmPayment.execute(order.id, paymentResult);
    
    const failedOrder = await repository.findById(order.id);
    expect(failedOrder!.getStatus().toString()).toBe(OrderStatus.Failed);
    expect((publisher.events[0] as any).constructor.name).toBe('OrderPaymentFailed');
  });

  it('should prevent fulfillment of non-paid orders', async () => {
    const order = await createOrder.execute([
      { productId: 'p1', quantity: 1, unitPrice: 50 },
    ]);
    
    // Try to fulfill without payment
    await expect(fulfillOrder.execute(order.id)).rejects.toThrow();
  });

  it('should maintain order state consistency across operations', async () => {
    const order = await createOrder.execute([
      { productId: 'p1', quantity: 5, unitPrice: 25 },
    ]);
    
    const orderId = order.id;
    
    // Verify initial state
    let retrieved = await repository.findById(orderId);
    expect(retrieved!.getTotalAmount()).toBe(125);
    
    // Request payment
    await requestPayment.execute(orderId);
    retrieved = await repository.findById(orderId);
    expect(retrieved!.getStatus().toString()).toBe(OrderStatus.PaymentPending);
    
    // Cannot request payment twice - should throw
    await expect(requestPayment.execute(orderId)).rejects.toThrow(OrderAlreadyFinalizedError);
    // State remains unchanged
    retrieved = await repository.findById(orderId);
    expect(retrieved!.getStatus().toString()).toBe(OrderStatus.PaymentPending);
  });

  it('should emit correct events for tracking', async () => {
    const allEvents: any[] = [];
    
    const order = await createOrder.execute([
      { productId: 'p1', quantity: 1, unitPrice: 100 },
    ]);
    allEvents.push(...publisher.events);
    
    publisher.events = [];
    await requestPayment.execute(order.id);
    allEvents.push(...publisher.events);
    
    publisher.events = [];
    const paymentResult = new PaymentResult({
      status: PaymentStatus.APPROVED,
      providerReference: 'ch_ok',
      receivedAt: new Date(),
    });
    await confirmPayment.execute(order.id, paymentResult);
    allEvents.push(...publisher.events);
    
    publisher.events = [];
    await fulfillOrder.execute(order.id);
    allEvents.push(...publisher.events);
    
    // Verify event names
    expect(allEvents[0].constructor.name).toBe('OrderCreated');
    expect(allEvents[1].constructor.name).toBe('OrderPaymentRequested');
    expect(allEvents[2].constructor.name).toBe('OrderPaid');
    expect(allEvents[3].constructor.name).toBe('OrderFulfilled');
  });

  it('should handle multiple orders independently', async () => {
    const order1 = await createOrder.execute([
      { productId: 'p1', quantity: 1, unitPrice: 50 },
    ]);
    
    const order2 = await createOrder.execute([
      { productId: 'p2', quantity: 2, unitPrice: 75 },
    ]);
    
    expect(order1.id).not.toBe(order2.id);
    expect(order1.getTotalAmount()).toBe(50);
    expect(order2.getTotalAmount()).toBe(150);
    
    // Process each independently
    await requestPayment.execute(order1.id);
    await confirmPayment.execute(order1.id, new PaymentResult({
      status: PaymentStatus.APPROVED,
      providerReference: 'ch_1',
      receivedAt: new Date(),
    }));
    
    // Order2 should still be in CREATED state
    const order2Check = await repository.findById(order2.id);
    expect(order2Check!.getStatus().toString()).toBe(OrderStatus.Created);
  });
});
