import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import AuthService from '../services/auth-service';
import { UserCreationParams } from '../models/UserCreationParams';
import { AuthenticatedUser } from '../models/AuthenticatedUser';
import { LoginDetails } from '../models/LoginDetails';
import { ExchangeRefreshTokenParams } from 'src/models/ExchangeRefreshTokenParams';

export class AuthController {
  private authService;

  constructor() {
    this.authService = new AuthService();
  }

  public async registerNewUserViaEmail(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { email, username, password } = req.body as UserCreationParams;

    try {
      const authorizedUser = await this.authService.registerUserViaEmail({
        email,
        username,
        password,
      });
      req.user = authorizedUser;
      return res.status(StatusCodes.CREATED).json(authorizedUser);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }

  public async loginUserViaEmail(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { email, password } = req.body as LoginDetails;
    try {
      const authorizedUser = await this.authService.loginUserViaEmail({
        email,
        password,
      });
      req.user = authorizedUser;

      return res.status(StatusCodes.OK).json(authorizedUser);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }

  public async exchangeRefreshToken(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { refreshToken } = req.body as ExchangeRefreshTokenParams;
    try {
      if (req.user) {
        const updated = await this.authService.exchangeRefreshToken(
          { refreshToken },
          req.user as AuthenticatedUser
        );
        return res.status(StatusCodes.OK).json(updated);
      } else {
        return res.status(StatusCodes.UNAUTHORIZED);
      }
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  }

  public async verifyToken(req: Request, res: Response): Promise<Response> {
    const { accessToken } = req.body;
    if (await this.authService.verifyToken(accessToken)) {
      return res.sendStatus(StatusCodes.OK);
    } else {
      return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }
  }
}
