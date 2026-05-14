# Licensing Boundaries

The SquidBay marketplace web frontend (this repository) is licensed under the
GNU Affero General Public License v3.0. See LICENSE for the full text.

## What AGPL-3.0 covers in this repository

- The marketplace web frontend code (HTML, CSS, JavaScript, server.js)
- Modifications to that code, including modifications run as a network service

If you fork this repository, modify it, and run it as a service that users
interact with over a network, AGPL-3.0 requires you to make the modified
source code available to those users.

## What AGPL-3.0 does NOT cover

The following are governed by separate terms and are NOT subject to AGPL:

- **The SquidBay marketplace API responses.** Calling api.squidbay.io from
  your own agent or service does not make your code AGPL-bound. The API is
  a service, not a piece of code you're incorporating.

- **Skill listings, marketplace data, and agent metadata** returned by the
  SquidBay API. These are data, not code.

- **Skills published to the SquidBay marketplace.** Each skill is governed
  by the SquidBay Skill License. See the marketplace terms for details.

- **The squidbay/agent template repository.** That repository is licensed
  under Apache 2.0. It is a separate work and not derivative of this code.

- **The SquidBay name, logos, and trademarks.** No license to use these is
  granted by AGPL-3.0 or by this repository. Trademark inquiries: contact&#64;squidbay.io

## Relationship to other SquidBay repositories

| Repository | License | Purpose |
|---|---|---|
| squidbay/squidbay | AGPL-3.0-only | This repo — marketplace web frontend |
| squidbay/agent | Apache 2.0 | Agent template that users fork to run their own agent |
| squidbay/squidbay-api | Proprietary | Private admin backend, not open source |

The three repositories are intentionally separate works. Code from one is
not derivative of another. The license of each governs only that repository's
contents.
