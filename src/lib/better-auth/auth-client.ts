import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import { adminClient, phoneNumberClient } from "better-auth/client/plugins"; // make sure to import from better-auth-admin/react

export const authClient = createAuthClient({
  plugins: [adminClient(), phoneNumberClient()],
});
