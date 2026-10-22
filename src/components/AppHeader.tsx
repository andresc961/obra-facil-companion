import { Link } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

/** Shared top bar: back on the left, centered logo + name, account on the right. */
export function AppHeader({ back, title }: { back: "/" | "/grabar"; title?: string }) {
  return (
    <>
      <header className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-center gap-3 py-4">
        <Link to={back} aria-label="Volver" className="grid h-9 w-9 place-items-center rounded-lg bg-card"><ArrowLeft className="h-5 w-5" /></Link>
        <Link to="/grabar" className="flex min-w-0 items-center justify-center gap-2">
          <img src={logoIcon} alt="" aria-hidden="true" width={256} height={256} className="h-7 w-7 shrink-0" />
          <span className="truncate font-display text-xl text-primary">ObraFácil</span>
        </Link>
        <Link to="/cuenta" aria-label="Mi cuenta" className="grid h-9 w-9 place-items-center rounded-lg bg-card"><UserRound className="h-5 w-5" /></Link>
      </header>
      {title && <h1 className="mb-4 text-center font-display text-2xl">{title}</h1>}
    </>
  );
}
