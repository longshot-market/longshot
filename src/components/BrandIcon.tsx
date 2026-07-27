import icon from "../../brand/longshot-icon-512.png";

// The self-contained "l" app-badge (dark rounded square, cream mark). Unlike the
// wordmark it carries its own background, so it reads on light and dark surfaces
// without inversion. Used to brand the auth/onboarding modals.
export default function BrandIcon({ className = "h-12 w-12" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon.src}
      alt="Longshot"
      className={`rounded-2xl ${className}`}
    />
  );
}
