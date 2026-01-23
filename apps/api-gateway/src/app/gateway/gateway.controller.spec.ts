import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// Mock JwtAuthGuard to always allow
jest.mock('../guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({ canActivate: () => true })),
}));

const mockGatewayService = {
  checkServicesHealth: jest.fn(),
};

describe('GatewayController', () => {
  let controller: GatewayController;
  let gatewayService: typeof mockGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        { provide: GatewayService, useValue: mockGatewayService },
      ],
    }).compile();

    controller = module.get<GatewayController>(GatewayController);
    gatewayService = module.get(GatewayService);
    jest.clearAllMocks();
  });

  it('should return health status', async () => {
    const result = await controller.health();
    expect(result.status).toBe('healthy');
    expect(result.service).toBe('api-gateway');
    expect(typeof result.timestamp).toBe('string');
  });
});
