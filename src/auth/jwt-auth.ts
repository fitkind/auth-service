import passport from 'passport';
import {
  ExtractJwt,
  Strategy,
  StrategyOptions,
  VerifiedCallback,
} from 'passport-jwt';

import { AuthenticatedUser } from '../models/AuthenticatedUser';
import { JWTPayload } from 'src/models/JWTPayload';
import User from '../models/User';

export default function setupJWTAuth() {
  const JWTOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
  };

  const JWTOptionsNoExpiration: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    ignoreExpiration: true,
  };

  const verifyUser = async (jwtPayload: JWTPayload, done: VerifiedCallback) => {
    const { _id } = jwtPayload;
    try {
      const user = await User.findById(_id);

      if (user) {
        const authenticatedUser: AuthenticatedUser = {
          _id,
          email: user.email,
        };
        return done(null, authenticatedUser);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  };

  passport.use(
    new Strategy(
      JWTOptions,
      async (jwtPayload: JWTPayload, done: VerifiedCallback) => {
        await verifyUser(jwtPayload, done);
      }
    )
  );

  passport.use(
    'jwtNoExpiration',
    new Strategy(
      JWTOptionsNoExpiration,
      async (jwtPayload: JWTPayload, done: VerifiedCallback) => {
        await verifyUser(jwtPayload, done);
      }
    )
  );
}
