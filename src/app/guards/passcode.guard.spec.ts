import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { passcodeGuard } from './passcode.guard';

describe('passcodeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => passcodeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
