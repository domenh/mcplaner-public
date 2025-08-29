## Housekeeping PR

**Kaj je vključeno**
- Dodan \.editorconfig\ (LF, UTF-8, konsistentni indenti; CRLF za *.ps1)
- Dodan \.nvmrc\ (\18\) za enotno Node verzijo
- Dodan \README.md\ (install/dev/build/deploy navodila)
- Dopolnjen \.gitignore\ (brez artefaktov, arhivov in >100 MB datotek)
- \git rm --cached\ za \ackups/\, \logs/\, \exports/\, \_support/\, \.tmp.driveupload/\ (če so bili trackani)

**Zakaj**
- Čistejši repo, manj nesporazumov pri build/deploy
- Stabilne linijske končnice (LF) in enotno okolje (Node 18)
- Preprečimo push velikih datotek (GitHub 100MB limit)

**Naslednji koraki (ločeni PR-ji)**
- Quick wins v \ite.config.js\ in \	ailwind.config.js\ (lint/opt)
- README razširitev (npr. AIO build & deploy skripta)
- Dodatek \.gitattributes\ za tekstovne tipe po potrebi

PR pripravljeno avtomatsko iz AIO skripte.