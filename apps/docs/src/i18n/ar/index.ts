// ar - assembles this language's message sections.
import common from './common.ts';
import atoms from './atoms.ts';
import molecules from './molecules.ts';
import organisms from './organisms.ts';
import structures from './structures.ts';
import foundations from './foundations.ts';
export { groupTitles, pageTitles } from './nav.ts';

export const messages = { common, atoms, molecules, organisms, structures, foundations };
