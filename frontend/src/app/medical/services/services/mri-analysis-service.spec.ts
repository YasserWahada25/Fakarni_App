import { TestBed } from '@angular/core/testing';

import { MriAnalysisService } from './mri-analysis-service';

describe('MriAnalysisService', () => {
  let service: MriAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MriAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
