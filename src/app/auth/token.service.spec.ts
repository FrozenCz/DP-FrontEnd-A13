import {TokenService} from './token.service';
import {RightsTag} from '../shared/rights.list';

describe('tokenService', () => {
  let tokenService: TokenService;

  beforeEach(async () => {
    tokenService = new TokenService();
  });

  it('should return false', () => {
    expect(tokenService.getPermission(RightsTag.changeAssetsUser)).toBe(false);
  });

  it('should return false', () => {
    expect(tokenService.getPermission(null)).toBe(false);
  });

  it('should return false', () => {
    expect(tokenService.getPermission(undefined)).toBe(false);
  });

  it('should return true', () => {
    expect(!tokenService.getPermission(RightsTag.updateLocation)).toBe(true);
  });

});
