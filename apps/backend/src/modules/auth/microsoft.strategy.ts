import passport from "passport";
import { OIDCStrategy } from "passport-azure-ad";

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.CLIENT_ID as string,
      responseType: "code",
      responseMode: "query",
      redirectUrl: "http://localhost:4000/auth/microsoft/callback",
      allowHttpForRedirectUrl: true,
      scope: ["profile", "email"],
      passReqToCallback: true,
    } as any, 
    async (
      _req: any,
      _issuer: any,
      _sub: any,
      profile: any,
      _accessToken: any,
      _refreshToken: any,
      done: any
    ) => {
      try {
        const email =
          profile?.upn ||
          profile?._json?.preferred_username ||
          profile?.emails?.[0];

        if (!email || !email.endsWith("@libas.in")) {
          return done(null, undefined);
        }

        return done(null, {
          email,
          name: profile.displayName,
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);
