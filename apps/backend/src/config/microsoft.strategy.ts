import { env } from "../config/env.js";
import passport from "passport";
import { OIDCStrategy } from "passport-azure-ad";

console.log("STRATEGY SEES:", {
  AZURE_CLIENT_ID: env.azureClientId,
  AZURE_TENANT_ID: env.azureTenantId,
  HAS_SECRET: !!env.azureClientSecret,
});

type MicrosoftProfile = {
  displayName?: string;
  upn?: string;
  emails?: string[];
  _json?: {
    preferred_username?: string;
  };
};

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${env.azureTenantId}/v2.0/.well-known/openid-configuration`,
      clientID: env.azureClientId,
      clientSecret: env.azureClientSecret,
      responseType: "code",
      responseMode: "query",
      redirectUrl: "http://localhost:4000/auth/microsoft/callback",
      allowHttpForRedirectUrl: true,
     scope: ["openid", "profile", "email", "User.Read"],
      passReqToCallback: false,
    },
    async (
      _issuer: string,
      _sub: string,
      profile: unknown,
      _accessToken: string,
      _refreshToken: string,
      done: (error: Error | null, user?: any) => void
    ) => {
      try {
        const p = profile as MicrosoftProfile;

        const email =
          p.upn ||
          p._json?.preferred_username ||
          p.emails?.[0];

        if (!email || !email.endsWith("@libas.in")) {
          return done(null, false);
        }
        if (!email) {
  return done(null, false);
}

        return done(null, {
          email,
          name: p.displayName,
          role: "EMPLOYEE",
        });
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);