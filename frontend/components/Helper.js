import Link from "next/link";

export const LoginLogo = () => {
  return (
    <div className="login_logo cursor">
      <Link href="/" legacyBehavior>
        <img src="/assets/img/logo.png" alt="" />
      </Link>
    </div>
  );
};
