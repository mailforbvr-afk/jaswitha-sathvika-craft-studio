"use client";

type WhatsAppButtonProps = {
  href: string | null;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "soft" | "header";
};

const variantClasses = {
  primary:
    "bg-whatsapp text-white hover:bg-whatsapp-hover focus-visible:outline-whatsapp",
  soft:
    "bg-white text-whatsapp border border-mint hover:bg-mint/40 focus-visible:outline-whatsapp",
  header:
    "border border-pink-deep bg-white text-pink-deep hover:bg-petal/50 focus-visible:outline-pink-deep",
};

export function WhatsAppButton({
  href,
  children,
  className = "",
  variant = "primary",
}: WhatsAppButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`;

  if (!href) {
    return (
      <button type="button" className={classes} disabled>
        {children}
        <span className="sr-only">WhatsApp number is not configured yet</span>
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {children}
    </a>
  );
}
