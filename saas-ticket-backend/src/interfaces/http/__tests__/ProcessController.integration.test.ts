/**
 * Integration Tests - Process API Workflow
 * Tests the complete process management workflow
 */

import { ProcessController } from '../ProcessController';
import { CreateAndActivateProcess } from '../../../application/use-cases/CreateAndActivateProcess';
import { StartExecution } from '../../../application/use-cases/StartExecution';

describe('ProcessController Integration', () => {
  let controller: ProcessController;
  let mockCreateAndActivateProcess: any;
  let mockStartExecution: any;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    // Mock use cases
    mockCreateAndActivateProcess = {
      execute: jest.fn().mockResolvedValue({
        id: 'proc-123',
        status: 'ACTIVE',
      }),
    };

    mockStartExecution = {
      execute: jest.fn().mockResolvedValue({
        id: 'exec-456',
        status: 'RUNNING',
      }),
    };

    controller = new ProcessController(
      mockStartExecution,
      mockCreateAndActivateProcess
    );

    // Mock Express request/response
    mockRequest = {
      body: {},
      headers: {
        authorization: 'Bearer valid-token',
      },
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  describe('Create Process', () => {
    it('should create a process successfully', async () => {
      // use proper UUIDs since validation enforces it
      mockRequest.body = {
        name: 'Order Fulfillment',
        organizationId: '00000000-0000-0000-0000-000000000000',
        steps: [
          { id: '00000000-0000-0000-0000-000000000000', name: 'Validate Order', order: 0 },
          { id: '00000000-0000-0000-0000-000000000000', name: 'Process Payment', order: 1 },
          { id: '00000000-0000-0000-0000-000000000000', name: 'Ship Order', order: 2 },
        ],
      }; 

      await controller.create(mockRequest, mockResponse);

      expect(mockCreateAndActivateProcess.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Order Fulfillment',
          organizationId: '00000000-0000-0000-0000-000000000000',
          steps: expect.arrayContaining([
            expect.objectContaining({ name: 'Validate Order' }),
          ]),
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          message: expect.any(String),
        })
      );
    });

    it('should validate process data', async () => {
      mockRequest.body = {
        name: '',
        organizationId: 'org-123',
        steps: [],
      };

      await controller.create(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should require at least one step', async () => {
      mockRequest.body = {
        name: 'Test Process',
        organizationId: 'org-123',
        steps: [],
      };

      await controller.create(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Start Execution', () => {
    it('should start execution of a process', async () => {
      mockRequest.body = {
        processId: '00000000-0000-0000-0000-000000000000',
        executionId: '00000000-0000-0000-0000-000000000000',
      }; 

      await controller.startExecution(mockRequest, mockResponse);

      expect(mockStartExecution.execute).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000000'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should validate UUID format', async () => {
      mockRequest.body = {
        processId: 'not-a-uuid',
        executionId: '11111111-1111-1111-1111-111111111111',
      }; 

      await controller.startExecution(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = {
        processId: '00000000-0000-0000-0000-000000000000',
      }; 

      await controller.startExecution(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Error Handling', () => {
    it('should log request details', async () => {
      mockRequest.body = {
        name: 'Test',
        organizationId: 'org-123',
        steps: [{ name: 'Step 1', order: 0 }],
      };

      await controller.create(mockRequest, mockResponse);

      expect(mockRequest.logger.info).toHaveBeenCalled();
    });

    it('should handle domain errors', async () => {
      mockCreateAndActivateProcess.execute.mockRejectedValueOnce(
        new Error('Process.alreadyActive')
      );

      mockRequest.body = {
        name: 'Test',
        organizationId: '00000000-0000-0000-0000-000000000000',
        steps: [{ id: '00000000-0000-0000-0000-000000000000', name: 'Step 1', order: 0 }],
      };

      await controller.create(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockRequest.logger.error).toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      mockCreateAndActivateProcess.execute.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      mockRequest.body = {
        name: 'Test',
        organizationId: '00000000-0000-0000-0000-000000000000',
        steps: [{ id: '00000000-0000-0000-0000-000000000000', name: 'Step 1', order: 0 }],
      };

      await controller.create(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Authentication & Authorization', () => {
    it('should extract correlation ID from request', async () => {
      mockRequest.headers['x-correlation-id'] = 'corr-123';
      mockRequest.body = {
        name: 'Test',
        organizationId: 'org-123',
        steps: [{ name: 'Step 1', order: 0 }],
      };

      await controller.create(mockRequest, mockResponse);

      expect(mockRequest.logger.info).toHaveBeenCalled();
    });

    it('should include request context in logs', async () => {
      mockRequest.body = {
        name: 'Test',
        organizationId: 'org-123',
        steps: [{ name: 'Step 1', order: 0 }],
      };

      await controller.create(mockRequest, mockResponse);

      expect(mockRequest.logger.info).toHaveBeenCalled();
    });
  });

  describe('Input Validation with Zod', () => {
    it('should reject invalid organization UUID', async () => {
      mockRequest.body = {
        name: 'Test Process',
        organizationId: 'not-a-uuid',
        steps: [{ id: '00000000-0000-0000-0000-000000000000', name: 'Step 1', order: 0 }],
      };  

      await controller.create(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should require step name minimum length', async () => {
      mockRequest.body = {
        name: 'Test Process',
        organizationId: '00000000-0000-0000-0000-000000000000',
        steps: [{ id: '00000000-0000-0000-0000-000000000000', name: '', order: 0 }],
      }; 

      await controller.create(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate step order is non-negative', async () => {
      mockRequest.body = {
        name: 'Test Process',
        organizationId: '00000000-0000-0000-0000-000000000000',
        steps: [{ id: '00000000-0000-0000-0000-000000000000', name: 'Step 1', order: -1 }],
      }; 

      await controller.create(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Response Format', () => {
    it('should return proper success response structure', async () => {
      mockRequest.body = {
        name: 'Test Process',
        organizationId: '00000000-0000-0000-0000-000000000000',
        steps: [{ id: '00000000-0000-0000-0000-000000000000', name: 'Step 1', order: 0 }],
      };

      await controller.create(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          message: expect.stringContaining('Process'),
        })
      );
    });

    it('should return error details in error response', async () => {
      mockRequest.body = {};

      await controller.create(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });
});
