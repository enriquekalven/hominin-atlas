import type { Species } from '../types';
import { species as panTroglodytes } from './pan-troglodytes';
import { species as panPaniscus } from './pan-paniscus';
import { species as sahelanthropusTchadensis } from './sahelanthropus-tchadensis';
import { species as orrorinTugenensis } from './orrorin-tugenensis';
import { species as ardipithecusRamidus } from './ardipithecus-ramidus';
import { species as australopithecusAnamensis } from './australopithecus-anamensis';
import { species as australopithecusAfarensis } from './australopithecus-afarensis';
import { species as australopithecusAfricanus } from './australopithecus-africanus';
import { species as australopithecusSediba } from './australopithecus-sediba';
import { species as paranthropusBoisei } from './paranthropus-boisei';
import { species as paranthropusRobustus } from './paranthropus-robustus';
import { species as homoHabilis } from './homo-habilis';
import { species as homoErectus } from './homo-erectus';
import { species as homoAntecessor } from './homo-antecessor';
import { species as homoHeidelbergensis } from './homo-heidelbergensis';
import { species as homoNeanderthalensis } from './homo-neanderthalensis';
import { species as denisovans } from './denisovans';
import { species as homoFloresiensis } from './homo-floresiensis';
import { species as homoLuzonensis } from './homo-luzonensis';
import { species as homoNaledi } from './homo-naledi';
import { species as homoSapiens } from './homo-sapiens';

/**
 * All 21 taxa in the atlas (one module per taxon in this folder), in SPECIES_IDS order.
 * `src/data/index.ts` re-sorts them by living outgroups first, then oldest first appearance.
 */
export const SPECIES_LIST: Species[] = [
  panTroglodytes,
  panPaniscus,
  sahelanthropusTchadensis,
  orrorinTugenensis,
  ardipithecusRamidus,
  australopithecusAnamensis,
  australopithecusAfarensis,
  australopithecusAfricanus,
  australopithecusSediba,
  paranthropusBoisei,
  paranthropusRobustus,
  homoHabilis,
  homoErectus,
  homoAntecessor,
  homoHeidelbergensis,
  homoNeanderthalensis,
  denisovans,
  homoFloresiensis,
  homoLuzonensis,
  homoNaledi,
  homoSapiens,
];
