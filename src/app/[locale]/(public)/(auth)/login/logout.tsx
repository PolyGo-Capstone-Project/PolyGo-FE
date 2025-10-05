import { memo, Suspense } from "react";

function LogoutComponent() {
  return null;
}

const Logout = memo(function LogoutInner() {
  return (
    <Suspense>
      <LogoutComponent />
    </Suspense>
  );
});

export default Logout;
