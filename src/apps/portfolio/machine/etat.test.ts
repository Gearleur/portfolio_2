import { describe, expect, it } from 'vitest';
import { lancer, versMachine } from './etat';
import type { Etat, Page } from './etat';

const ACCUEIL: Page = { adresse: '', langue: 'fr' };
const PROJET: Page = { adresse: 'sncf-gpt', langue: 'en', numero: '02' };
const HUMAIN: Etat = { ...ACCUEIL, machine: false };

describe('the Machine mode’s state on the Vitrine', () => {
  it('starts on the human side', () => {
    expect(versMachine(HUMAIN, '')).toBe(false);
  });

  it('thrown towards the Machine, keeps the page it was thrown on: its language, its project', () => {
    const etat = lancer(HUMAIN, true, PROJET);
    expect(etat).toEqual({ machine: true, adresse: 'sncf-gpt', langue: 'en', numero: '02' });
    expect(versMachine(etat, 'sncf-gpt')).toBe(true);
  });

  it('thrown back, keeps where the terminal was opened: thrown again from the same page, the terminal is where it was left', () => {
    const machine = lancer(HUMAIN, true, PROJET);
    const retour = lancer(machine, false, PROJET);
    expect(retour).toEqual({ ...machine, machine: false });
    expect(versMachine(retour, 'sncf-gpt')).toBe(false);
    expect(lancer(retour, true, PROJET)).toEqual(machine);
    // nothing changes when it is already on the human side
    expect(lancer(retour, false, ACCUEIL)).toBe(retour);
  });

  it('gives the human page back when the address changes under the terminal (back button, link)', () => {
    const machine = lancer(HUMAIN, true, PROJET);
    expect(versMachine(machine, '')).toBe(false);
    expect(versMachine(machine, 'whiteboard-amdec')).toBe(false);
    // and the switch thrown again from there opens the terminal on the new page
    const encore = lancer(machine, true, { adresse: 'whiteboard-amdec', langue: 'fr', numero: '01' });
    expect(encore).toEqual({ machine: true, adresse: 'whiteboard-amdec', langue: 'fr', numero: '01' });
    expect(versMachine(encore, 'whiteboard-amdec')).toBe(true);
  });

  it('a project thrown from the home after a project forgets the project', () => {
    const projet = lancer(HUMAIN, true, PROJET);
    expect(lancer(projet, true, ACCUEIL).numero).toBeUndefined();
  });
});
