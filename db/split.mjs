/**
 * Split a .sql file into individual statements.
 *
 * The Neon HTTP driver (and PGlite) run one statement per call, so the schema
 * has to be broken up. Whole-line `--` comments are stripped first: leaving
 * them in would make a commented statement look like a comment and get
 * skipped. This is deliberately naive — it assumes no `--` or `;` inside string
 * literals, which holds for db/schema.sql.
 */
export function splitStatements(sql) {
  return sql
    .replace(/^[ \t]*--.*$/gm, '')
    .split(/;\s*$/m)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)
}
