import LoginForm from "@/components/auth/login-form";
import { pageTitle } from "@/lib/brand";

export const metadata = {
  title: pageTitle("Login"),
};

export default function LoginPage() {
  return <LoginForm />;
}
