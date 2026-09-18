# Dependency ownership and change procedure

CHAT01 owns root manifests, lockfiles, lint/type/import configuration, `contracts/http`, `packages/ts`,
neutral scaffolding and dependency-boundary definitions. Later chats request dependency additions through
CHAT00 -> CHAT01/root ownership; they must not independently rewrite root locks/configs.

A controlled dependency change must: preserve the DOC-23 major/minor line, update the applicable root lock,
run static dependency checks, run affected tests, and retain repository-wide guard checks. Major runtime/framework/
database/search/Redis/queue changes require DOC-23 impact review before adoption.

The public frontend rule is absolute: shared semantics do not create a shared public visual runtime.
