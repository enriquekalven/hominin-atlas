import type { Citation } from './types';

/**
 * Bibliography for the Hominin Atlas (owned by the data curator).
 *
 * Conventions
 * - `id`: first-author surname (lowercase ASCII) + year, with a/b suffixes when needed.
 * - `doi`: Crossref-verified bare DOI for every journal article and DOI-indexed chapter.
 * - `url`: Direct publisher, museum, or WorldCat bibliographic landing page for print monographs
 *   and undated museum summaries that do not carry a Crossref DOI (never a search engine query).
 */

/** Citation with a verified DOI. */
function d(c: Omit<Citation, 'url'> & { doi: string }): Citation {
  return { ...c, url: null };
}

/** Citation for a print book or non-DOI archival work with a canonical publisher/WorldCat URL. */
function u(c: Omit<Citation, 'doi'> & { url: string }): Citation {
  return { ...c, doi: null };
}

export const CITATIONS: Citation[] = [
  // ── Chimpanzee & Bonobo (living Pan outgroups) ─────────────────────────────────────────────────
  d({ id: 'mcbrearty2005', authors: 'McBrearty S, Jablonski NG', year: 2005, title: 'First fossil chimpanzee', journal: 'Nature', doi: '10.1038/nature04008' }),
  d({ id: 'chimpconsortium2005', authors: 'Chimpanzee Sequencing and Analysis Consortium', year: 2005, title: 'Initial sequence of the chimpanzee genome and comparison with the human genome', journal: 'Nature', doi: '10.1038/nature04072' }),
  d({ id: 'prufer2012', authors: 'Prüfer K, Munch K, Hellmann I, et al.', year: 2012, title: 'The bonobo genome compared with the chimpanzee and human genomes', journal: 'Nature', doi: '10.1038/nature11128' }),
  d({ id: 'jurmain1997', authors: 'Jurmain R', year: 1997, title: 'Skeletal evidence of trauma in African apes, with special reference to the Gombe chimpanzees', journal: 'Primates', doi: '10.1007/bf02385918' }),
  d({ id: 'smith1997', authors: 'Smith RJ, Jungers WL', year: 1997, title: 'Body mass in comparative primatology', journal: 'Journal of Human Evolution', doi: '10.1006/jhev.1996.0122' }),

  // ── Sahelanthropus & Orrorin (Late Miocene hominins) ───────────────────────────────────────────
  d({ id: 'brunet2002', authors: 'Brunet M, Guy F, Pilbeam D, et al.', year: 2002, title: 'A new hominid from the Upper Miocene of Chad, Central Africa', journal: 'Nature', doi: '10.1038/nature00879' }),
  d({ id: 'zollikofer2005', authors: 'Zollikofer CPE, Ponce de León MS, Lieberman DE, et al.', year: 2005, title: 'Virtual cranial reconstruction of Sahelanthropus tchadensis', journal: 'Nature', doi: '10.1038/nature03397' }),
  d({ id: 'lebatard2008', authors: 'Lebatard AE, Bourlès DL, Duringer P, et al.', year: 2008, title: 'Cosmogenic nuclide dating of Sahelanthropus tchadensis and Australopithecus bahrelghazali: Mio-Pliocene hominids from Chad', journal: 'Proceedings of the National Academy of Sciences USA', doi: '10.1073/pnas.0708015105' }),
  d({ id: 'senut2001', authors: 'Senut B, Pickford M, Gommery D, Mein P, Cheboi K, Coppens Y', year: 2001, title: 'First hominid from the Miocene (Lukeino Formation, Kenya)', journal: "Comptes Rendus de l'Académie des Sciences - Series IIA - Earth and Planetary Science", doi: '10.1016/S1251-8050(01)01529-4' }),
  d({ id: 'richmond2008', authors: 'Richmond BG, Jungers WL', year: 2008, title: 'Orrorin tugenensis femoral morphology and the evolution of hominin bipedalism', journal: 'Science', doi: '10.1126/science.1154197' }),

  // ── Ardipithecus ───────────────────────────────────────────────────────────────────────────────
  d({ id: 'white2009', authors: 'White TD, Asfaw B, Beyene Y, et al.', year: 2009, title: 'Ardipithecus ramidus and the paleobiology of early hominids', journal: 'Science', doi: '10.1126/science.1175802' }),
  d({ id: 'suwa2009', authors: 'Suwa G, Asfaw B, Kono RT, et al.', year: 2009, title: 'The Ardipithecus ramidus skull and its implications for hominid origins', journal: 'Science', doi: '10.1126/science.1175825' }),

  // ── Australopithecus anamensis & afarensis ─────────────────────────────────────────────────────
  d({ id: 'leakey1995', authors: 'Leakey MG, Feibel CS, McDougall I, Walker A', year: 1995, title: 'New four-million-year-old hominid species from Kanapoi and Allia Bay, Kenya', journal: 'Nature', doi: '10.1038/376565a0' }),
  d({ id: 'haileselassie2019', authors: 'Haile-Selassie Y, Melillo SM, Vazzana A, Benazzi S, Ryan TM', year: 2019, title: 'A 3.8-million-year-old hominin cranium from Woranso-Mille, Ethiopia', journal: 'Nature', doi: '10.1038/s41586-019-1513-8' }),
  d({ id: 'harmand2015', authors: 'Harmand S, Lewis JE, Feibel CS, et al.', year: 2015, title: '3.3-million-year-old stone tools from Lomekwi 3, West Turkana, Kenya', journal: 'Nature', doi: '10.1038/nature14464' }),
  d({ id: 'johanson1976', authors: 'Johanson DC, Taieb M', year: 1976, title: 'Plio-Pleistocene hominid discoveries in Hadar, Ethiopia', journal: 'Nature', doi: '10.1038/260293a0' }),
  d({ id: 'kappelman2016', authors: 'Kappelman J, Ketcham RA, Pearce S, et al.', year: 2016, title: 'Perimortem fractures in Lucy suggest mortality from fall out of tall tree', journal: 'Nature', doi: '10.1038/nature19332' }),
  d({ id: 'charlier2018a', authors: 'Charlier P, Coppens Y, Augias A, et al.', year: 2018, title: "Mudslide and/or animal attack are more plausible causes and circumstances of death for AL 288 ('Lucy'): a forensic anthropology analysis", journal: 'Medico-Legal Journal', doi: '10.1177/0025817217749504' }),
  d({ id: 'mchenry1991', authors: 'McHenry HM', year: 1991, title: 'Femoral lengths and stature in Plio-Pleistocene hominids', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.1330850204' }),
  d({ id: 'mchenry1992', authors: 'McHenry HM', year: 1992, title: 'Body size and proportions in early hominids', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.1330870404' }),

  // ── Australopithecus africanus ─────────────────────────────────────────────────────────────────
  d({ id: 'dart1925', authors: 'Dart RA', year: 1925, title: 'Australopithecus africanus: the man-ape of South Africa', journal: 'Nature', doi: '10.1038/115195a0' }),
  d({ id: 'berger1995', authors: 'Berger LR, Clarke RJ', year: 1995, title: 'Eagle involvement in accumulation of the Taung child fauna', journal: 'Journal of Human Evolution', doi: '10.1006/jhev.1995.1060' }),
  d({ id: 'berger2006', authors: 'Berger LR', year: 2006, title: 'Brief communication: Predatory bird damage to the Taung type-skull of Australopithecus africanus Dart 1925', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.20415' }),

  // ── Australopithecus sediba ────────────────────────────────────────────────────────────────────
  d({ id: 'berger2010', authors: 'Berger LR, de Ruiter DJ, Churchill SE, et al.', year: 2010, title: 'Australopithecus sediba: a new species of Homo-like australopith from South Africa', journal: 'Science', doi: '10.1126/science.1184944' }),
  d({ id: 'pickering2011', authors: 'Pickering R, Dirks PHGM, Jinnah Z, et al.', year: 2011, title: 'Australopithecus sediba at 1.977 Ma and implications for the origins of the genus Homo', journal: 'Science', doi: '10.1126/science.1203697' }),
  d({ id: 'carlson2011', authors: 'Carlson KJ, Stout D, Jashashvili T, et al.', year: 2011, title: 'The endocast of MH1, Australopithecus sediba', journal: 'Science', doi: '10.1126/science.1203922' }),
  d({ id: 'randolphquinney2016', authors: 'Randolph-Quinney PS, Williams SA, Steyn M, et al.', year: 2016, title: 'Osteogenic tumour in Australopithecus sediba: Earliest hominin evidence for neoplastic disease', journal: 'South African Journal of Science', doi: '10.17159/sajs.2016/20150470' }),

  // ── Paranthropus ───────────────────────────────────────────────────────────────────────────────
  d({ id: 'leakey1959', authors: 'Leakey LSB', year: 1959, title: 'A new fossil skull from Olduvai', journal: 'Nature', doi: '10.1038/184491a0' }),
  d({ id: 'cerling2011', authors: 'Cerling TE, Mbua E, Kirera FM, et al.', year: 2011, title: 'Diet of Paranthropus boisei in the early Pleistocene of East Africa', journal: 'Proceedings of the National Academy of Sciences USA', doi: '10.1073/pnas.1105545108' }),
  d({ id: 'brain1970', authors: 'Brain CK', year: 1970, title: 'New finds at the Swartkrans australopithecine site', journal: 'Nature', doi: '10.1038/2251112a0' }),
  d({ id: 'backwell2001', authors: "Backwell LR, d'Errico F", year: 2001, title: 'Evidence of termite foraging by Swartkrans early hominids', journal: 'Proceedings of the National Academy of Sciences USA', doi: '10.1073/pnas.98.4.1358' }),
  u({ id: 'brain1981', authors: 'Brain CK', year: 1981, title: 'The Hunters or the Hunted? An Introduction to African Cave Taphonomy', journal: 'University of Chicago Press (book)', url: 'https://press.uchicago.edu/ucp/books/book/chicago/H/bo3637401.html' }),

  // ── Early Homo & Homo antecessor ───────────────────────────────────────────────────────────────
  d({ id: 'leakey1964', authors: 'Leakey LSB, Tobias PV, Napier JR', year: 1964, title: 'A new species of the genus Homo from Olduvai Gorge', journal: 'Nature', doi: '10.1038/202007a0' }),
  d({ id: 'spoor2015', authors: 'Spoor F, Gunz P, Neubauer S, et al.', year: 2015, title: 'Reconstructed Homo habilis type OH 7 suggests deep-rooted species diversity in early Homo', journal: 'Nature', doi: '10.1038/nature14224' }),
  d({ id: 'brown1985', authors: 'Brown F, Harris J, Leakey R, Walker A', year: 1985, title: 'Early Homo erectus skeleton from west Lake Turkana, Kenya', journal: 'Nature', doi: '10.1038/316788a0' }),
  d({ id: 'latimer1993', authors: 'Latimer B, Ward CV', year: 1993, title: 'The Thoracic and Lumbar Vertebrae (in Walker & Leakey, eds., The Nariokotome Homo erectus Skeleton)', journal: 'Springer / Harvard University Press', doi: '10.1007/978-3-662-10382-1_12' }),
  d({ id: 'haeusler2013', authors: 'Haeusler M, Schiess R, Boeni T', year: 2013, title: 'Evidence for juvenile disc herniation in a Homo erectus boy skeleton', journal: 'Spine / Journal of Human Evolution (2014 companion)', doi: '10.1016/j.jhevol.2013.12.009' }),
  d({ id: 'meyer2015', authors: 'Meyer MR, Haeusler M', year: 2015, title: 'Spinal cord evolution in early Homo', journal: 'Journal of Human Evolution', doi: '10.1016/j.jhevol.2015.09.001' }),
  d({ id: 'walker1982', authors: 'Walker A, Zimmerman MR, Leakey REF', year: 1982, title: 'A possible case of hypervitaminosis A in Homo erectus', journal: 'Nature', doi: '10.1038/296248a0' }),
  d({ id: 'rothschild1995', authors: 'Rothschild BM, Hershkovitz I, Rothschild C', year: 1995, title: 'Origin of yaws in the Pleistocene', journal: 'Nature', doi: '10.1038/378343b0' }),
  d({ id: 'lordkipanidze2005', authors: 'Lordkipanidze D, Vekua A, Ferring R, et al.', year: 2005, title: 'The earliest toothless hominin skull', journal: 'Nature', doi: '10.1038/434717b' }),
  d({ id: 'margvelashvili2013', authors: 'Margvelashvili A, Zollikofer CPE, Lordkipanidze D, Peltomäki T, Ponce de León MS', year: 2013, title: 'Tooth wear and dentoalveolar remodeling are key factors of morphological variation in the Dmanisi mandibles', journal: 'Proceedings of the National Academy of Sciences USA', doi: '10.1073/pnas.1316052110' }),
  d({ id: 'rizal2020', authors: 'Rizal Y, Westaway KE, Zaim Y, et al.', year: 2020, title: 'Last appearance of Homo erectus at Ngandong, Java, 117,000–108,000 years ago', journal: 'Nature', doi: '10.1038/s41586-019-1863-2' }),
  d({ id: 'herries2020', authors: 'Herries AIR, Martin JM, Leece AB, et al.', year: 2020, title: 'Contemporaneity of Australopithecus, Paranthropus, and early Homo erectus in South Africa', journal: 'Science', doi: '10.1126/science.aaw7293' }),
  d({ id: 'lordkipanidze2013', authors: 'Lordkipanidze D, Ponce de León MS, Margvelashvili A, et al.', year: 2013, title: 'A complete skull from Dmanisi, Georgia, and the evolutionary biology of early Homo', journal: 'Science', doi: '10.1126/science.1238484' }),
  d({ id: 'bramble2004', authors: 'Bramble DM, Lieberman DE', year: 2004, title: 'Endurance running and the evolution of Homo', journal: 'Nature', doi: '10.1038/nature03052' }),
  d({ id: 'bermudezdecastro1997', authors: 'Bermúdez de Castro JM, Arsuaga JL, Carbonell E, Rosas A, Martínez I, Mosquera M', year: 1997, title: 'A hominid from the Lower Pleistocene of Atapuerca, Spain: possible ancestor to Neandertals and modern humans', journal: 'Science', doi: '10.1126/science.276.5317.1392' }),
  d({ id: 'welker2020', authors: 'Welker F, Ramos-Madrigal J, Gutenkunst RN, et al.', year: 2020, title: 'The dental proteome of Homo antecessor', journal: 'Nature', doi: '10.1038/s41586-020-2153-8' }),
  d({ id: 'fernandezjalvo1999', authors: 'Fernández-Jalvo Y, Díez JC, Cáceres I, Rosell J', year: 1999, title: 'Human cannibalism in the Early Pleistocene of Europe (Gran Dolina, Sierra de Atapuerca, Burgos, Spain)', journal: 'Journal of Human Evolution', doi: '10.1006/jhev.1999.0324' }),

  // ── Middle Pleistocene Homo ────────────────────────────────────────────────────────────────────
  d({ id: 'grun2020', authors: 'Grün R, Pike A, McDermott F, et al.', year: 2020, title: 'Dating the skull from Broken Hill, Zambia, and its position in human evolution', journal: 'Nature', doi: '10.1038/s41586-020-2165-4' }),
  d({ id: 'wagner2010', authors: 'Wagner GA, Krbetschek M, Degering D, et al.', year: 2010, title: 'Radiometric dating of the type-site for Homo heidelbergensis at Mauer, Germany', journal: 'Proceedings of the National Academy of Sciences USA', doi: '10.1073/pnas.1012722107' }),
  d({ id: 'bartsiokas1993', authors: 'Bartsiokas A, Day MH', year: 1993, title: 'Lead poisoning and dental caries in the Broken Hill hominid', journal: 'Journal of Human Evolution', doi: '10.1006/jhev.1993.1019' }),
  d({ id: 'arsuaga2014', authors: 'Arsuaga JL, Martínez I, Arnold LJ, et al.', year: 2014, title: 'Neandertal roots: Cranial and chronological evidence from Sima de los Huesos', journal: 'Science', doi: '10.1126/science.1253958' }),
  d({ id: 'meyer2016', authors: 'Meyer M, Arsuaga JL, de Filippo C, et al.', year: 2016, title: 'Nuclear DNA sequences from the Middle Pleistocene Sima de los Huesos hominins', journal: 'Nature', doi: '10.1038/nature17405' }),

  // ── Neanderthals ───────────────────────────────────────────────────────────────────────────────
  d({ id: 'trinkaus1982', authors: 'Trinkaus E, Zimmerman MR', year: 1982, title: 'Trauma among the Shanidar Neandertals', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.1330570108' }),
  u({ id: 'trinkaus1983', authors: 'Trinkaus E', year: 1983, title: 'The Shanidar Neandertals', journal: 'Academic Press (book)', url: 'https://search.worldcat.org/isbn/9780127005508' }),
  d({ id: 'trinkaus2017', authors: 'Trinkaus E, Villotte S', year: 2017, title: 'External auditory exostoses and hearing loss in the Shanidar 1 Neandertal', journal: 'PLoS ONE', doi: '10.1371/journal.pone.0186684' }),
  d({ id: 'higham2014', authors: 'Higham T, Douka K, Wood R, et al.', year: 2014, title: 'The timing and spatiotemporal patterning of Neanderthal disappearance', journal: 'Nature', doi: '10.1038/nature13621' }),
  d({ id: 'green2010', authors: 'Green RE, Krause J, Briggs AW, et al.', year: 2010, title: 'A draft sequence of the Neandertal genome', journal: 'Science', doi: '10.1126/science.1188021' }),

  // ── Denisovans ─────────────────────────────────────────────────────────────────────────────────
  d({ id: 'krause2010', authors: 'Krause J, Fu Q, Good JM, et al.', year: 2010, title: 'The complete mitochondrial DNA genome of an unknown hominin from southern Siberia', journal: 'Nature', doi: '10.1038/nature08976' }),
  d({ id: 'reich2010', authors: 'Reich D, Green RE, Kircher M, et al.', year: 2010, title: 'Genetic history of an archaic hominin group from Denisova Cave in Siberia', journal: 'Nature', doi: '10.1038/nature09710' }),
  d({ id: 'slon2018', authors: 'Slon V, Mafessoni F, Vernot B, et al.', year: 2018, title: 'The genome of the offspring of a Neanderthal mother and a Denisovan father', journal: 'Nature', doi: '10.1038/s41586-018-0455-x' }),
  d({ id: 'chen2019', authors: 'Chen F, Welker F, Shen CC, et al.', year: 2019, title: 'A late Middle Pleistocene Denisovan mandible from the Tibetan Plateau', journal: 'Nature', doi: '10.1038/s41586-019-1139-x' }),
  d({ id: 'ji2021', authors: 'Ji Q, Wu W, Ji Y, et al.', year: 2021, title: 'Late Middle Pleistocene Harbin cranium represents a new Homo species', journal: 'The Innovation', doi: '10.1016/j.xinn.2021.100132' }),
  d({ id: 'shao2021', authors: 'Shao Q, Ge J, Ji Q, et al.', year: 2021, title: 'Geochemical provenancing and direct dating of the Harbin archaic human cranium', journal: 'The Innovation', doi: '10.1016/j.xinn.2021.100131' }),
  d({ id: 'huertasanchez2014', authors: 'Huerta-Sánchez E, Jin X, Asan, et al.', year: 2014, title: 'Altitude adaptation in Tibetans caused by introgression of Denisovan-like DNA', journal: 'Nature', doi: '10.1038/nature13408' }),

  // ── Homo floresiensis ──────────────────────────────────────────────────────────────────────────
  d({ id: 'brown2004', authors: 'Brown P, Sutikna T, Morwood MJ, et al.', year: 2004, title: 'A new small-bodied hominin from the Late Pleistocene of Flores, Indonesia', journal: 'Nature', doi: '10.1038/nature02999' }),
  d({ id: 'morwood2004', authors: 'Morwood MJ, Soejono RP, Roberts RG, et al.', year: 2004, title: 'Archaeology and age of a new hominin from Flores in eastern Indonesia', journal: 'Nature', doi: '10.1038/nature02956' }),
  d({ id: 'sutikna2016', authors: 'Sutikna T, Tocheri MW, Morwood MJ, et al.', year: 2016, title: 'Revised stratigraphy and chronology for Homo floresiensis at Liang Bua in Indonesia', journal: 'Nature', doi: '10.1038/nature17179' }),
  d({ id: 'vandenbergh2016', authors: 'van den Bergh GD, Kaifu Y, Kurniawan I, et al.', year: 2016, title: 'Homo floresiensis-like fossils from the early Middle Pleistocene of Flores', journal: 'Nature', doi: '10.1038/nature17999' }),
  d({ id: 'kubo2013', authors: 'Kubo D, Kono RT, Kaifu Y', year: 2013, title: 'Brain size of Homo floresiensis and its evolutionary implications', journal: 'Proceedings of the Royal Society B', doi: '10.1098/rspb.2013.0338' }),
  d({ id: 'falk2007', authors: 'Falk D, Hildebolt C, Smith K, et al.', year: 2007, title: 'Brain shape in human microcephalics and Homo floresiensis', journal: 'Proceedings of the National Academy of Sciences USA', doi: '10.1073/pnas.0609185104' }),
  d({ id: 'henneberg2014', authors: 'Henneberg M, Eckhardt RB, Chavanaves S, Hsü KJ', year: 2014, title: 'Evolved developmental homeostasis disturbed in LB1 from Flores, Indonesia, denotes Down syndrome and not diagnostic traits of the invalid species Homo floresiensis', journal: 'Proceedings of the National Academy of Sciences USA', doi: '10.1073/pnas.1407382111' }),

  // ── Homo luzonensis ────────────────────────────────────────────────────────────────────────────
  d({ id: 'detroit2019', authors: 'Détroit F, Mijares AS, Corny J, et al.', year: 2019, title: 'A new species of Homo from the Late Pleistocene of the Philippines', journal: 'Nature', doi: '10.1038/s41586-019-1067-9' }),
  d({ id: 'mijares2010', authors: 'Mijares AS, Détroit F, Piper P, et al.', year: 2010, title: 'New evidence for a 67,000-year-old human presence at Callao Cave, Luzon, Philippines', journal: 'Journal of Human Evolution', doi: '10.1016/j.jhevol.2010.04.008' }),
  d({ id: 'ingicco2018', authors: 'Ingicco T, van den Bergh GD, Jago-on C, et al.', year: 2018, title: 'Earliest known hominin activity in the Philippines by 709 thousand years ago', journal: 'Nature', doi: '10.1038/s41586-018-0072-8' }),

  // ── Homo naledi ────────────────────────────────────────────────────────────────────────────────
  d({ id: 'berger2015', authors: 'Berger LR, Hawks J, de Ruiter DJ, et al.', year: 2015, title: 'Homo naledi, a new species of the genus Homo from the Dinaledi Chamber, South Africa', journal: 'eLife', doi: '10.7554/eLife.09560' }),
  d({ id: 'dirks2017', authors: 'Dirks PHGM, Roberts EM, Hilbert-Wolf H, et al.', year: 2017, title: 'The age of Homo naledi and associated sediments in the Rising Star Cave, South Africa', journal: 'eLife', doi: '10.7554/eLife.24231' }),
  d({ id: 'hawks2017', authors: 'Hawks J, Elliott M, Schmid P, et al.', year: 2017, title: 'New fossil remains of Homo naledi from the Lesedi Chamber, South Africa', journal: 'eLife', doi: '10.7554/eLife.24232' }),

  // ── Homo sapiens ───────────────────────────────────────────────────────────────────────────────
  d({ id: 'hublin2017', authors: 'Hublin JJ, Ben-Ncer A, Bailey SE, et al.', year: 2017, title: 'New fossils from Jebel Irhoud, Morocco and the pan-African origin of Homo sapiens', journal: 'Nature', doi: '10.1038/nature22336' }),
  d({ id: 'richter2017', authors: 'Richter D, Grün R, Joannes-Boyau R, et al.', year: 2017, title: 'The age of the hominin fossils from Jebel Irhoud, Morocco, and the origins of the Middle Stone Age', journal: 'Nature', doi: '10.1038/nature22335' }),
  d({ id: 'vidal2022', authors: 'Vidal CM, Lane CS, Asrat A, et al.', year: 2022, title: 'Age of the oldest known Homo sapiens from eastern Africa', journal: 'Nature', doi: '10.1038/s41586-021-04275-8' }),
  d({ id: 'henrygambier2002', authors: 'Henry-Gambier D', year: 2002, title: 'Les fossiles de Cro-Magnon (Les Eyzies-de-Tayac, Dordogne): nouvelles données sur leur position chronologique et leur attribution culturelle', journal: 'PALEO', doi: '10.4000/paleo.1424' }),
  d({ id: 'charlier2018b', authors: 'Charlier P, Nadia B, Philippe F, et al.', year: 2018, title: 'Did Cro-Magnon 1 have neurofibromatosis type 1?', journal: 'The Lancet', doi: '10.1016/s0140-6736(18)30495-1' }),

  // ── Summary statistics (museum reference) ──────────────────────────────────────────────────────
  u({
    id: 'smithsonian-hop',
    authors: 'Smithsonian National Museum of Natural History, Human Origins Program',
    year: 2026,
    title: 'Human Fossils: Species pages (summary body-size and brain-size values; year = curation/consultation year, pages are undated)',
    journal: null,
    url: 'https://humanorigins.si.edu/evidence/human-fossils/species',
  }),

  // ── Additional peer-reviewed primary sources (all DOIs Crossref-verified) ──────────────────────
  d({ id: 'alemseged2006', authors: 'Alemseged Z, Spoor F, Kimbel WH, et al.', year: 2006, title: 'A juvenile early hominin skeleton from Dikika, Ethiopia', journal: 'Nature', doi: '10.1038/nature05047' }),
  d({ id: 'arensburg1989', authors: 'Arensburg B, Tillier AM, Vandermeersch B, et al.', year: 1989, title: 'A Middle Palaeolithic human hyoid bone', journal: 'Nature', doi: '10.1038/338758a0' }),
  d({ id: 'argue2017', authors: 'Argue D, Groves CP, Lee MSY, Jungers WL', year: 2017, title: 'The affinities of Homo floresiensis based on phylogenetic analyses of cranial, dental, and postcranial characters', journal: 'Journal of Human Evolution', doi: '10.1016/j.jhevol.2017.02.006' }),
  d({ id: 'arsuaga1993', authors: 'Arsuaga JL, Martínez I, Gracia A, Carretero JM, Carbonell E', year: 1993, title: 'Three new human skulls from the Sima de los Huesos Middle Pleistocene site in Sierra de Atapuerca, Spain', journal: 'Nature', doi: '10.1038/362534a0' }),
  d({ id: 'baab2016', authors: 'Baab KL, Brown P, Falk D, et al.', year: 2016, title: 'A critical evaluation of the Down syndrome diagnosis for LB1, type specimen of Homo floresiensis', journal: 'PLoS ONE', doi: '10.1371/journal.pone.0155731' }),
  d({ id: 'beier2018', authors: 'Beier J, Anthes N, Wahl J, Harvati K', year: 2018, title: 'Similar cranial trauma prevalence among Neanderthals and Upper Palaeolithic modern humans', journal: 'Nature', doi: '10.1038/s41586-018-0696-8' }),
  d({ id: 'bennett2019', authors: 'Bennett EA, Crevecoeur I, Viola B, et al.', year: 2019, title: 'Morphology of the Denisovan phalanx closer to modern humans than to Neanderthals', journal: 'Science Advances', doi: '10.1126/sciadv.aaw3950' }),
  d({ id: 'berger1995b', authors: 'Berger TD, Trinkaus E', year: 1995, title: 'Patterns of trauma among the Neandertals', journal: 'Journal of Archaeological Science', doi: '10.1016/0305-4403(95)90013-6' }),
  d({ id: 'berger2023', authors: 'Berger LR, Makhubela T, Molopyane K, et al.', year: 2023, title: 'Evidence for deliberate burial of the dead by Homo naledi', journal: 'eLife', doi: '10.7554/eLife.89106' }),
  d({ id: 'bonmati2010', authors: 'Bonmatí A, Gómez-Olivencia A, Arsuaga JL, et al.', year: 2010, title: 'Middle Pleistocene lower back and pelvis from an aged human individual from the Sima de los Huesos site, Spain', journal: 'Proceedings of the National Academy of Sciences of the USA', doi: '10.1073/pnas.1012131107' }),
  d({ id: 'brown2012', authors: 'Brown P', year: 2012, title: 'LB1 and LB6 Homo floresiensis are not modern human (Homo sapiens) cretins', journal: 'Journal of Human Evolution', doi: '10.1016/j.jhevol.2011.10.011' }),
  d({ id: 'brown2016', authors: 'Brown S, Higham T, Slon V, et al.', year: 2016, title: 'Identification of a new hominin bone from Denisova Cave, Siberia using collagen fingerprinting and mitochondrial DNA analysis', journal: 'Scientific Reports', doi: '10.1038/srep23559' }),
  d({ id: 'brown2022', authors: 'Brown S, Massilani D, Kozlikin MB, et al.', year: 2022, title: 'The earliest Denisovans and their cultural adaptation', journal: 'Nature Ecology & Evolution', doi: '10.1038/s41559-021-01581-2' }),
  d({ id: 'browning2018', authors: 'Browning SR, Browning BL, Zhou Y, Tucci S, Akey JM', year: 2018, title: 'Analysis of human sequence data reveals two pulses of archaic Denisovan admixture', journal: 'Cell', doi: '10.1016/j.cell.2018.02.031' }),
  d({ id: 'brumm2016', authors: 'Brumm A, van den Bergh GD, Storey M, et al.', year: 2016, title: 'Age and context of the oldest known hominin fossils from Flores', journal: 'Nature', doi: '10.1038/nature17663' }),
  d({ id: 'chang2015', authors: 'Chang CH, Kaifu Y, Takai M, et al.', year: 2015, title: 'The first archaic Homo from Taiwan', journal: 'Nature Communications', doi: '10.1038/ncomms7037' }),
  d({ id: 'churchill2009', authors: 'Churchill SE, Franciscus RG, McKean-Peraza HA, Daniel JA, Warren BR', year: 2009, title: 'Shanidar 3 Neandertal rib puncture wound and paleolithic weaponry', journal: 'Journal of Human Evolution', doi: '10.1016/j.jhevol.2009.05.010' }),
  d({ id: 'cook1983', authors: 'Cook DC, Buikstra JE, DeRousseau CJ, Johanson DC', year: 1983, title: 'Vertebral pathology in the Afar australopithecines', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.1330600113' }),
  d({ id: 'coqueugniot2014', authors: 'Coqueugniot H, Dutour O, Arensburg B, Duday H, Vandermeersch B, Tillier AM', year: 2014, title: 'Earliest cranio-encephalic trauma from the Levantine Middle Palaeolithic: 3D reappraisal of the Qafzeh 11 skull, consequences of pediatric brain damage on individual life condition and social care', journal: 'PLoS ONE', doi: '10.1371/journal.pone.0102822' }),
  d({ id: 'crubezy1992', authors: 'Crubézy E, Trinkaus E', year: 1992, title: 'Shanidar 1: a case of hyperostotic disease (DISH) in the middle Paleolithic', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.1330890402' }),
  d({ id: 'danastasio2013', authors: "D'Anastasio R, Wroe S, Tuniz C, et al.", year: 2013, title: 'Micro-biomechanics of the Kebara 2 hyoid and its implications for speech in Neanderthals', journal: 'PLoS ONE', doi: '10.1371/journal.pone.0082261' }),
  u({ id: 'dastugue1967', authors: 'Dastugue J', year: 1967, title: "Pathologie des hommes fossiles de l'abri de Cro-Magnon", journal: "L'Anthropologie", url: 'https://search.worldcat.org/oclc/493657268' }),
  d({ id: 'daver2022', authors: 'Daver G, Guy F, Mackaye HT, et al.', year: 2022, title: 'Postcranial evidence of late Miocene hominin bipedalism in Chad', journal: 'Nature', doi: '10.1038/s41586-022-04901-z' }),
  d({ id: 'demanuel2016', authors: 'de Manuel M, Kuhlwilm M, Frandsen P, et al.', year: 2016, title: 'Chimpanzee genomic diversity reveals ancient admixture with bonobos', journal: 'Science', doi: '10.1126/science.aag2602' }),
  d({ id: 'demeter2022', authors: 'Demeter F, Zanolli C, Westaway KE, et al.', year: 2022, title: 'A Middle Pleistocene Denisovan molar from the Annamite Chain of northern Laos', journal: 'Nature Communications', doi: '10.1038/s41467-022-29923-z' }),
  d({ id: 'dibble2015', authors: 'Dibble HL, Aldeias V, Goldberg P, McPherron SP, Sandgathe D, Steele TE', year: 2015, title: 'A critical look at evidence from La Chapelle-aux-Saints supporting an intentional Neandertal burial', journal: 'Journal of Archaeological Science', doi: '10.1016/j.jas.2014.04.019' }),
  d({ id: 'dirks2015', authors: 'Dirks PHGM, Berger LR, Roberts EM, et al.', year: 2015, title: 'Geological and taphonomic context for the new hominin species Homo naledi from the Dinaledi Chamber, South Africa', journal: 'eLife', doi: '10.7554/eLife.09561' }),
  d({ id: 'douka2019', authors: 'Douka K, Slon V, Jacobs Z, et al.', year: 2019, title: 'Age estimates for hominin fossils and the onset of the Upper Palaeolithic at Denisova Cave', journal: 'Nature', doi: '10.1038/s41586-018-0870-z' }),
  d({ id: 'falk2005', authors: 'Falk D, Hildebolt C, Smith K, et al.', year: 2005, title: 'The brain of LB1, Homo floresiensis', journal: 'Science', doi: '10.1126/science.1109727' }),
  d({ id: 'falk2009', authors: 'Falk D, Hildebolt C, Smith K, et al.', year: 2009, title: 'The type specimen (LB1) of Homo floresiensis did not have Laron Syndrome', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.21035' }),
  d({ id: 'frayer1987', authors: 'Frayer DW, Horton WA, Macchiarelli R, Mussi M', year: 1987, title: 'Dwarfism in an adolescent from the Italian late Upper Palaeolithic', journal: 'Nature', doi: '10.1038/330060a0' }),
  d({ id: 'fu2025a', authors: 'Fu Q, Cao P, Dai Q, et al.', year: 2025, title: 'The proteome of the late Middle Pleistocene Harbin individual', journal: 'Science', doi: '10.1126/science.adu9677' }),
  d({ id: 'fu2025b', authors: 'Fu Q, Bai F, Rao H, et al.', year: 2025, title: 'Denisovan mitochondrial DNA from dental calculus of the >146,000-year-old Harbin cranium', journal: 'Cell', doi: '10.1016/j.cell.2025.05.040' }),
  d({ id: 'goodall1964', authors: 'Goodall J', year: 1964, title: 'Tool-using and aimed throwing in a community of free-living chimpanzees', journal: 'Nature', doi: '10.1038/2011264a0' }),
  d({ id: 'gostner2002', authors: 'Gostner P, Egarter Vigl E', year: 2002, title: 'INSIGHT: Report of radiological-forensic findings on the Iceman', journal: 'Journal of Archaeological Science', doi: '10.1006/jasc.2002.0824' }),
  d({ id: 'gracia2009', authors: 'Gracia A, Arsuaga JL, Martínez I, Lorenzo C, Carretero JM, Bermúdez de Castro JM, Carbonell E', year: 2009, title: 'Craniosynostosis in the Middle Pleistocene human Cranium 14 from the Sima de los Huesos, Atapuerca, Spain', journal: 'Proceedings of the National Academy of Sciences of the USA', doi: '10.1073/pnas.0900965106' }),
  d({ id: 'haeusler2019', authors: 'Haeusler M, Trinkaus E, Fornai C, Müller J, Bonneau N, Boeni T, Frater N', year: 2019, title: 'Morphology, pathology, and the vertebral posture of the La Chapelle-aux-Saints Neandertal', journal: 'Proceedings of the National Academy of Sciences of the USA', doi: '10.1073/pnas.1820745116' }),
  d({ id: 'haileselassie2010', authors: 'Haile-Selassie Y, Latimer BM, Alene M, et al.', year: 2010, title: 'An early Australopithecus afarensis postcranium from Woranso-Mille, Ethiopia', journal: 'Proceedings of the National Academy of Sciences of the USA', doi: '10.1073/pnas.1004527107' }),
  d({ id: 'henry2011', authors: 'Henry AG, Brooks AS, Piperno DR', year: 2011, title: 'Microfossils in calculus demonstrate consumption of plants and cooked foods in Neanderthal diets (Shanidar III, Iraq; Spy I and II, Belgium)', journal: 'Proceedings of the National Academy of Sciences of the USA', doi: '10.1073/pnas.1016868108' }),
  d({ id: 'hershkovitz2007', authors: 'Hershkovitz I, Kornreich L, Laron Z', year: 2007, title: 'Comparative skeletal features between Homo floresiensis and patients with primary growth hormone insensitivity (Laron Syndrome)', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.20655' }),
  d({ id: 'jacob2006', authors: 'Jacob T, Indriati E, Soejono RP, et al.', year: 2006, title: 'Pygmoid Australomelanesian Homo sapiens skeletal remains from Liang Bua, Flores: population affinities and pathological abnormalities', journal: 'Proceedings of the National Academy of Sciences USA', doi: '10.1073/pnas.0605563103' }),
  d({ id: 'jacobs2019', authors: 'Jacobs GS, Hudjashov G, Saag L, et al.', year: 2019, title: 'Multiple deeply divergent Denisovan ancestries in Papuans', journal: 'Cell', doi: '10.1016/j.cell.2019.02.035' }),
  d({ id: 'jungers2009', authors: 'Jungers WL, Harcourt-Smith WEH, Wunderlich RE, et al.', year: 2009, title: 'The foot of Homo floresiensis', journal: 'Nature', doi: '10.1038/nature07989' }),
  d({ id: 'kaifu2024', authors: 'Kaifu Y, Kurniawan I, Mizushima S, et al.', year: 2024, title: 'Early evolution of small body size in Homo floresiensis', journal: 'Nature Communications', doi: '10.1038/s41467-024-50649-7' }),
  d({ id: 'kimbel2009', authors: 'Kimbel WH, Delezene LK', year: 2009, title: '"Lucy" redux: a review of research on Australopithecus afarensis', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.21183' }),
  d({ id: 'krings1997', authors: 'Krings M, Stone A, Schmitz RW, Krainitzki H, Stoneking M, Pääbo S', year: 1997, title: 'Neandertal DNA sequences and the origin of modern humans', journal: 'Cell', doi: '10.1016/S0092-8674(00)80310-4' }),
  d({ id: 'leakey1979', authors: 'Leakey MD, Hay RL', year: 1979, title: 'Pliocene footprints in the Laetolil Beds at Laetoli, northern Tanzania', journal: 'Nature', doi: '10.1038/278317a0' }),
  d({ id: 'lovejoy2009', authors: 'Lovejoy CO, Latimer B, Suwa G, Asfaw B, White TD', year: 2009, title: 'Combining prehension and propulsion: the foot of Ardipithecus ramidus', journal: 'Science', doi: '10.1126/science.1175832' }),
  d({ id: 'macchiarelli2020', authors: 'Macchiarelli R, Bergeret-Medina A, Marchi D, Wood B', year: 2020, title: 'Nature and relationships of Sahelanthropus tchadensis', journal: 'Journal of Human Evolution', doi: '10.1016/j.jhevol.2020.102898' }),
  d({ id: 'martinontorres2024', authors: 'Martinón-Torres M, Garate D, Herries AIR, Petraglia MD', year: 2024, title: 'No scientific evidence that Homo naledi buried their dead and produced rock art', journal: 'Journal of Human Evolution', doi: '10.1016/j.jhevol.2023.103464' }),
  d({ id: 'mcdougall2005', authors: 'McDougall I, Brown FH, Fleagle JG', year: 2005, title: 'Stratigraphic placement and age of modern humans from Kibish, Ethiopia', journal: 'Nature', doi: '10.1038/nature03258' }),
  d({ id: 'mercader2007', authors: 'Mercader J, Barton H, Gillespie J, et al.', year: 2007, title: '4,300-year-old chimpanzee sites and the origins of percussive stone technology', journal: 'Proceedings of the National Academy of Sciences of the USA', doi: '10.1073/pnas.0607909104' }),
  d({ id: 'meyer2012', authors: 'Meyer M, Kircher M, Gansauge MT, et al.', year: 2012, title: 'A high-coverage genome sequence from an archaic Denisovan individual', journal: 'Science', doi: '10.1126/science.1224344' }),
  d({ id: 'monge2013', authors: 'Monge J, Kricun M, Radovčić J, Radovčić D, Mann A, Frayer DW', year: 2013, title: 'Fibrous dysplasia in a 120,000+ year old Neandertal from Krapina, Croatia', journal: 'PLoS ONE', doi: '10.1371/journal.pone.0064539' }),
  d({ id: 'morwood2005', authors: 'Morwood MJ, Brown P, Jatmiko, et al.', year: 2005, title: 'Further evidence for small-bodied hominins from the Late Pleistocene of Flores, Indonesia', journal: 'Nature', doi: '10.1038/nature04022' }),
  d({ id: 'murphy2003', authors: 'Murphy WA Jr, zur Nedden D, Gostner P, Knapp R, Recheis W, Seidler H', year: 2003, title: 'The Iceman: discovery and imaging', journal: 'Radiology', doi: '10.1148/radiol.2263020338' }),
  d({ id: 'ncdrisc2016', authors: 'NCD Risk Factor Collaboration (NCD-RisC)', year: 2016, title: 'A century of trends in adult human height', journal: 'eLife', doi: '10.7554/eLife.13410' }),
  d({ id: 'ni2021', authors: 'Ni X, Ji Q, Wu W, et al.', year: 2021, title: 'Massive cranium from Harbin in northeastern China establishes a new Middle Pleistocene human lineage', journal: 'The Innovation', doi: '10.1016/j.xinn.2021.100130' }),
  d({ id: 'obendorf2008', authors: 'Obendorf PJ, Oxnard CE, Kefford BJ', year: 2008, title: 'Are the small human-like fossils found on Flores human endemic cretins?', journal: 'Proceedings of the Royal Society B', doi: '10.1098/rspb.2007.1488' }),
  d({ id: 'odes2018', authors: 'Odes EJ, Delezene LK, Randolph-Quinney PS, et al.', year: 2018, title: 'A case of benign osteogenic tumour in Homo naledi: Evidence for peripheral osteoma in the U.W. 101-1142 mandible', journal: 'International Journal of Paleopathology', doi: '10.1016/j.ijpp.2017.05.003' }),
  d({ id: 'perez1997', authors: 'Pérez PJ, Gracia A, Martínez I, Arsuaga JL', year: 1997, title: 'Paleopathological evidence of the cranial remains from the Sima de los Huesos Middle Pleistocene site (Sierra de Atapuerca, Spain). Description and preliminary inferences', journal: 'Journal of Human Evolution', doi: '10.1006/jhev.1997.0139' }),
  d({ id: 'pernter2007', authors: 'Pernter P, Gostner P, Egarter Vigl E, Rühli FJ', year: 2007, title: "Radiologic proof for the Iceman's cause of death (ca. 5'300 years ago)", journal: 'Journal of Archaeological Science', doi: '10.1016/j.jas.2006.12.019' }),
  d({ id: 'prufer2014', authors: 'Prüfer K, Racimo F, Patterson N, et al.', year: 2014, title: 'The complete genome sequence of a Neanderthal from the Altai Mountains', journal: 'Nature', doi: '10.1038/nature12886' }),
  d({ id: 'rendu2014', authors: 'Rendu W, Beauval C, Crevecoeur I, et al.', year: 2014, title: 'Evidence supporting an intentional Neandertal burial at La Chapelle-aux-Saints', journal: 'Proceedings of the National Academy of Sciences of the USA', doi: '10.1073/pnas.1316780110' }),
  d({ id: 'richards2009', authors: 'Richards MP, Trinkaus E', year: 2009, title: 'Isotopic evidence for the diets of European Neanderthals and early modern humans', journal: 'Proceedings of the National Academy of Sciences of the USA', doi: '10.1073/pnas.0903821106' }),
  d({ id: 'sala2015', authors: 'Sala N, Arsuaga JL, Pantoja-Pérez A, et al.', year: 2015, title: 'Lethal interpersonal violence in the Middle Pleistocene', journal: 'PLoS ONE', doi: '10.1371/journal.pone.0126589' }),
  d({ id: 'schmitz2002', authors: 'Schmitz RW, Serre D, Bonani G, et al.', year: 2002, title: 'The Neandertal type site revisited: interdisciplinary investigations of skeletal remains from the Neander Valley, Germany', journal: 'Proceedings of the National Academy of Sciences of the USA', doi: '10.1073/pnas.192464099' }),
  d({ id: 'semaw2005', authors: 'Semaw S, Simpson SW, Quade J, et al.', year: 2005, title: 'Early Pliocene hominids from Gona, Ethiopia', journal: 'Nature', doi: '10.1038/nature03177' }),
  d({ id: 'tocheri2007', authors: 'Tocheri MW, Orr CM, Larson SG, et al.', year: 2007, title: 'The primitive wrist of Homo floresiensis and its implications for hominin evolution', journal: 'Science', doi: '10.1126/science.1147143' }),
  d({ id: 'towle2017', authors: 'Towle I, Irish JD, De Groote I', year: 2017, title: 'Behavioral inferences from the high levels of dental chipping in Homo naledi', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.23250' }),
  d({ id: 'trinkaus1985', authors: 'Trinkaus E', year: 1985, title: 'Pathology and the posture of the La Chapelle-aux-Saints Neandertal', journal: 'American Journal of Physical Anthropology', doi: '10.1002/ajpa.1330670105' }),
  d({ id: 'tsutaya2025', authors: 'Tsutaya T, Sawafuji R, Taurozzi AJ, et al.', year: 2025, title: 'A male Denisovan mandible from Pleistocene Taiwan', journal: 'Science', doi: '10.1126/science.ads3888' }),
  d({ id: 'valladas1987', authors: 'Valladas H, Joron JL, Valladas G, et al.', year: 1987, title: 'Thermoluminescence dates for the Neanderthal burial site at Kebara in Israel', journal: 'Nature', doi: '10.1038/330159a0' }),
  d({ id: 'valladas1988', authors: 'Valladas H, Reyss JL, Joron JL, Valladas G, Bar-Yosef O, Vandermeersch B', year: 1988, title: "Thermoluminescence dating of Mousterian 'Proto-Cro-Magnon' remains from Israel and the origin of modern man", journal: 'Nature', doi: '10.1038/331614a0' }),
  d({ id: 'vignaud2002', authors: 'Vignaud P, Duringer P, Mackaye HT, et al.', year: 2002, title: 'Geology and palaeontology of the Upper Miocene Toros-Menalla hominid locality, Chad', journal: 'Nature', doi: '10.1038/nature00880' }),
  d({ id: 'walpole2012', authors: 'Walpole SC, Prieto-Merino D, Edwards P, Cleland J, Stevens G, Roberts I', year: 2012, title: 'The weight of nations: an estimation of adult human biomass', journal: 'BMC Public Health', doi: '10.1186/1471-2458-12-439' }),
  d({ id: 'white1994', authors: 'White TD, Suwa G, Asfaw B', year: 1994, title: 'Australopithecus ramidus, a new species of early hominid from Aramis, Ethiopia', journal: 'Nature', doi: '10.1038/371306a0' }),
  d({ id: 'wilson2014', authors: 'Wilson ML, Boesch C, Fruth B, et al.', year: 2014, title: 'Lethal aggression in Pan is better explained by adaptive strategies than human impacts', journal: 'Nature', doi: '10.1038/nature13727' }),
  d({ id: 'woldegabriel2009', authors: 'WoldeGabriel G, Ambrose SH, Barboni D, et al.', year: 2009, title: 'The geological, isotopic, botanical, invertebrate, and lower vertebrate surroundings of Ardipithecus ramidus', journal: 'Science', doi: '10.1126/science.1175817' }),
  d({ id: 'wolpoff2002', authors: 'Wolpoff MH, Senut B, Pickford M, Hawks J', year: 2002, title: "Sahelanthropus or 'Sahelpithecus'?", journal: 'Nature', doi: '10.1038/419581a' }),
  d({ id: 'xia2024', authors: 'Xia H, Zhang D, Wang J, et al.', year: 2024, title: 'Middle and Late Pleistocene Denisovan subsistence at Baishiya Karst Cave', journal: 'Nature', doi: '10.1038/s41586-024-07612-9' }),
  d({ id: 'zavala2021', authors: 'Zavala EI, Jacobs Z, Vernot B, et al.', year: 2021, title: 'Pleistocene sediment DNA reveals hominin and faunal turnovers at Denisova Cave', journal: 'Nature', doi: '10.1038/s41586-021-03675-0' }),
  d({ id: 'zhang2020', authors: 'Zhang D, Xia H, Chen F, et al.', year: 2020, title: 'Denisovan DNA in Late Pleistocene sediments from Baishiya Karst Cave on the Tibetan Plateau', journal: 'Science', doi: '10.1126/science.abb6320' }),
];
