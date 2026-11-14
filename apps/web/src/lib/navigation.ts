// Entrées de la navigation principale. Configuration statique, sans logique métier.
export type NavigationItem = {
  href: string;
  label: string;
};

export const navigationItems: readonly NavigationItem[] = [
  { href: "/projects", label: "Projets" },
  { href: "/chat", label: "Chat" },
];

/** Indique si une entrée correspond au chemin courant (y compris ses sous-pages). */
export function isActiveItem(item: NavigationItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
