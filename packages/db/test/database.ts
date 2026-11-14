import postgres from "postgres";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * URL de la base de test. Elle est entièrement effacée à chaque exécution :
 * on refuse toute base qui n'est pas locale, pour ne jamais toucher une vraie base.
 */
export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TEST_DATABASE_URL est requis pour les tests de base de données (voir packages/db/README.md).",
    );
  }
  const { hostname } = new URL(url);
  if (!LOCAL_HOSTS.has(hostname)) {
    throw new Error(`TEST_DATABASE_URL doit pointer vers une base locale (reçu : ${hostname}).`);
  }
  return url;
}

export function connect(): postgres.Sql {
  return postgres(testDatabaseUrl(), { max: 1, onnotice: () => {} });
}
