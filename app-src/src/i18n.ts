import { useStore } from './store';

const D = {
  appName: ['TreadFleet', 'TreadFleet'],
  owner: ['Office', 'Bureau'], tech: ['Technician', 'Technicien'],
  navJobs: ['Jobs', 'Travaux'], navFleets: ['Fleets', 'Flottes'], navPrices: ['Price list', 'Liste de prix'], navSettings: ['Settings', 'Paramètres'], navToday: ['Today', "Aujourd'hui"],
  demo: ['Demo mode: data stays in this browser', 'Mode démo : les données restent dans ce navigateur'],
  // setup
  setupTitle: ['Set up your company', 'Configurez votre entreprise'], setupLead: ['Takes about a minute. You can change everything later.', 'Environ une minute. Tout se modifie plus tard.'],
  companyName: ['Company name', "Nom de l'entreprise"], province: ['Province', 'Province'], invoicePrefix: ['Invoice prefix', 'Préfixe de facture'], nextInvoice: ['Next invoice number', 'Prochain numéro de facture'],
  gst: ['GST/HST number', 'Numéro de TPS/TVH'], qst: ['QST number (Quebec)', 'Numéro de TVQ (Québec)'], phone: ['Phone', 'Téléphone'], address: ['Address', 'Adresse'], email: ['Email', 'Courriel'],
  createCompany: ['Create company', "Créer l'entreprise"], orSample: ['or try it with sample data', 'ou essayez avec des données exemples'], loadSample: ['Load sample shop', "Charger l'atelier exemple"],
  // jobs
  jobs: ['Jobs', 'Travaux'], newJob: ['New job', 'Nouveau travail'], status: ['Status', 'Statut'], fleet: ['Fleet', 'Flotte'], unit: ['Unit', 'Unité'], po: ['PO', 'BC'], location: ['Location', 'Lieu'], techL: ['Technician', 'Technicien'], type: ['Type', 'Type'], description: ['Description', 'Description'], total: ['Total', 'Total'], created: ['Created', 'Créé'],
  road_call: ['Road call', 'Appel de service'], yard_check: ['Yard check', 'Vérification en cour'], shop: ['Shop', 'Atelier'],
  st_new: ['New', 'Nouveau'], st_dispatched: ['Dispatched', 'Envoyé'], st_recorded: ['Recorded', 'Enregistré'], st_review: ['To review', 'À vérifier'], st_approved: ['Approved', 'Approuvé'], st_sent: ['Sent', 'Envoyé à la flotte'], st_closed: ['Closed', 'Fermé'],
  noJobs: ['No jobs yet. Create one, or load the sample shop in Settings.', 'Aucun travail. Créez-en un, ou chargez l’atelier exemple dans Paramètres.'],
  create: ['Create', 'Créer'], cancel: ['Cancel', 'Annuler'], save: ['Save', 'Enregistrer'], delete: ['Delete', 'Supprimer'], add: ['Add', 'Ajouter'], edit: ['Edit', 'Modifier'], back: ['Back', 'Retour'], none: ['None', 'Aucun'], choose: ['Choose…', 'Choisir…'], unassigned: ['Unassigned', 'Non assigné'],
  // job page
  voiceNote: ['Voice note', 'Note vocale'], noNote: ['No voice note yet. The technician records it from their phone.', 'Pas encore de note vocale. Le technicien l’enregistre sur son téléphone.'],
  extracted: ['What TreadFleet picked out', 'Ce que TreadFleet a repéré'], lines: ['Invoice lines', 'Lignes de facture'], item: ['Item', 'Article'], qty: ['Qty', 'Qté'], price: ['Price', 'Prix'], amount: ['Amount', 'Montant'], from: ['from', 'source'],
  addLine: ['Add line', 'Ajouter une ligne'], addFromList: ['Add from price list', 'Ajouter depuis la liste'], review: ['Check', 'À vérifier'], reviewed: ['Mark checked', 'Marquer vérifié'],
  torque: ['Torque records', 'Registres de couple'], position: ['Position', 'Position'], value: ['Value', 'Valeur'], pattern: ['Pattern', 'Séquence'], retorque: ['Re-torque', 'Resserrage'], atKm: ['at {n} km', 'à {n} km'], noTorque: ['No torque recorded.', 'Aucun couple consigné.'], addTorque: ['Add torque', 'Ajouter un couple'],
  tqLow: ['Unusually low for a commercial wheel. Check the value.', 'Valeur inhabituellement basse pour une roue commerciale. Vérifiez.'], tqHigh: ['Unusually high. Check the value.', 'Valeur inhabituellement élevée. Vérifiez.'],
  subtotal: ['Subtotal', 'Sous-total'], approve: ['Approve invoice', 'Approuver la facture'], approved: ['Approved', 'Approuvée'], readyTo: ['Ready to approve', 'Prête à approuver'], before: ['Before you can approve', 'Avant d’approuver'],
  viewInvoice: ['View invoice', 'Voir la facture'], send: ['Mark as sent', 'Marquer comme envoyée'], emailFleet: ['Email to fleet', 'Envoyer à la flotte'], print: ['Print or save PDF', 'Imprimer ou PDF'], history: ['History', 'Historique'],
  frozen: ['This invoice is approved and can no longer change.', 'Cette facture est approuvée et ne peut plus changer.'],
  photos: ['Photos', 'Photos'], reextract: ['Read the note again', 'Relire la note'],
  // invoice
  invoice: ['Invoice', 'Facture'], billTo: ['Bill to', 'Facturer à'], date: ['Date', 'Date'], jobNo: ['Job', 'Travail'], gstReg: ['GST/HST reg.', 'TPS/TVH n°'], attached: ['Attached: work order, torque record, photos', 'Joints : bon de travail, registre de couple, photos'], thanks: ['Thank you for your business.', 'Merci de votre confiance.'],
  // tech
  todayFor: ['Today · {n}', "Aujourd'hui · {n}"], noToday: ['No jobs assigned to you right now.', "Aucun travail ne vous est assigné pour l'instant."], openJob: ['Open', 'Ouvrir'], call: ['Call', 'Appeler'], navigate: ['Navigate', 'Itinéraire'],
  talk: ['Press and talk', 'Appuyez et parlez'], stop: ['Stop', 'Arrêter'], listening: ['Listening…', 'Écoute…'], typeInstead: ['Or type the note', 'Ou tapez la note'], useSample: ['Use a sample note', 'Utiliser une note exemple'],
  addPhoto: ['Add photo', 'Ajouter une photo'], submit: ['Send to office', 'Envoyer au bureau'], sentToOffice: ['Sent. The office will review it.', 'Envoyé. Le bureau va le vérifier.'], noSpeech: ['Live transcription is not available in this browser. Type the note, or use the sample.', "La transcription en direct n'est pas offerte dans ce navigateur. Tapez la note ou utilisez l'exemple."],
  readingNote: ['Reading the note…', 'Lecture de la note…'], whoAmI: ['I am', 'Je suis'],
  // fleets & prices
  fleets: ['Fleets', 'Flottes'], apEmail: ['Accounts payable email', 'Courriel des comptes fournisseurs'], poRequired: ['PO required', 'BC obligatoire'], poPattern: ['PO format (optional)', 'Format du BC (facultatif)'], notes: ['Notes', 'Notes'], newFleet: ['New fleet', 'Nouvelle flotte'],
  prices: ['Price list', 'Liste de prix'], code: ['Code', 'Code'], kind: ['Kind', 'Type'], size: ['Size', 'Dimension'], unitL: ['Unit', 'Unité'], aliases: ['Words techs use', 'Mots des techniciens'], importCsv: ['Import CSV', 'Importer un CSV'], csvHelp: ['Columns: code, kind (tire, labour, service, fee, credit), description, size, unit (each, hour, job), price in dollars, words techs use separated by |', 'Colonnes : code, type (tire, labour, service, fee, credit), description, dimension, unité (each, hour, job), prix en dollars, mots des techniciens séparés par |'],
  newItem: ['New item', 'Nouvel article'], imported: ['Imported {n} items', '{n} articles importés'],
  k_tire: ['Tire', 'Pneu'], k_labour: ['Labour', "Main-d'œuvre"], k_service: ['Service', 'Service'], k_fee: ['Fee', 'Frais'], k_credit: ['Credit', 'Crédit'],
  // settings
  settings: ['Settings', 'Paramètres'], company: ['Company', 'Entreprise'], retorqueKm: ['Re-torque reminder (km)', 'Rappel de resserrage (km)'], exportCsv: ['Export invoices (CSV)', 'Exporter les factures (CSV)'], resetDemo: ['Reset demo data', 'Réinitialiser la démo'], resetSure: ['Click again to erase everything in this browser', 'Cliquez encore pour tout effacer dans ce navigateur'],
  aiMode: ['Voice notes are read with the built-in demo reader. Connect the AI service to read any wording.', 'Les notes sont lues avec le lecteur démo intégré. Connectez le service IA pour lire toutes les formulations.'],
} as const;

export type Key = keyof typeof D;
export function tr(lang: 'en' | 'fr', k: Key, vars?: Record<string, string | number>) {
  let s: string = D[k][lang === 'fr' ? 1 : 0];
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, String(b));
  return s;
}
export function useT() {
  const lang = useStore(s => s.lang);
  return { lang, t: (k: Key, vars?: Record<string, string | number>) => tr(lang, k, vars) };
}
