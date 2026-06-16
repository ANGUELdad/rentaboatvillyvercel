import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const enPath = join(root, "data", "blog", "en.json");

const articles = JSON.parse(readFileSync(enPath, "utf8"));

const POLICY_REPLACEMENTS = [
  [/swim ashore/gi, "swim from the boat ladder"],
  [/going ashore/gi, "staying on board"],
  [/lunch ashore/gi, "lunch on board"],
  [/go ashore/gi, "stay on board"],
  [/land the boat/gi, "anchor offshore"],
  [/climbing ashore/gi, "using the swim ladder"],
  [/explore the peninsula at your own pace/gi, "view the peninsula coastline from the water and snorkel the ruins"],
  [/explore peninsula ashore/gi, "view the coastline from the boat"],
  [/exploring the peninsula ashore/gi, "viewing the coastline from the boat"],
  [/tavernas ashore/gi, "picnic lunch on board"],
  [/hours ashore/gi, "time at anchor"],
  [/drop off/gi, "be dropped off"],
  [/landings easier/gi, "boarding from the swim ladder easier"],
  [/anchoring or ashore options/gi, "anchoring and on-board swim options"],
  [/speakers ashore near other boats/gi, "speakers at anchor near other boats"],
  [/harbour lunch at Potos/gi, "lunch on board at anchor near Potos"],
  [/harbour lunch,/gi, "lunch on board at anchor,"],
  [/Potos lunch/gi, "lunch on board at anchor near Potos"],
  [/lunch ashore at a harbour taverna/gi, "lunch on board at anchor"],
  [/lunch ashore at Potos/gi, "lunch on board at anchor near Potos"],
  [/tavernas at Potos and Limenaria cover lunch if you stop ashore/gi, "pack lunch and snacks for meals on board — guests must stay on the boat at all anchor stops"],
  [/tavernas at Limenaria and Potos for meals/gi, "cooler space on board for packed lunch and snacks — all meals are enjoyed on board"],
  [/Potos harbour offers calm lunch breaks/gi, "anchor near Potos for a calm on-board lunch break"],
  [/One hour ashore is enough/gi, "One hour at anchor is enough"],
  [/One to one-and-a-half hours ashore/gi, "One to one-and-a-half hours at anchor"],
  [/What to bring ashore/gi, "What to bring on board"],
  [/coffee, gyros, and a swim in one stop/gi, "offshore views, a swim from the ladder, and lunch on board in one stop"],
  [/Taversnas ashore if you want lunch before the beach anchor/gi, "offshore anchor near Potos if you want lunch on board before the Chrisi Akti anchor"],
  [/fuel-and-coffee break on the outbound or return leg/gi, "offshore anchor break on the outbound or return leg"],
];

const ARTICLE_CONTENT_OVERRIDES = {
  "golden-beach-thassos-by-boat": {
    content: `<h2>Golden Beach from the sea</h2>
<p>Golden Beach (Chrisi Akti) stretches over two kilometres of soft sand on Thassos' east coast. By boat you skip inland traffic and anchor directly offshore for a swim from the boat ladder.</p>
<p>Rent A Boat Villy hourly rentals depart Limenaria Marina — you are the skipper after a full safety briefing. Guests stay on board at all stops.</p>
<h2>The east-coast run</h2>
<p>Head south past Potos then east along the open coast. Allow roughly 90 minutes each way in a 30HP speedboat depending on sea state.</p>
<p>Our Golden Beach Run track on the <a href="/map">sea atlas</a> follows the recommended offshore GPS path with distance and cruise-time notes.</p>
<h3>When to go</h3>
<p>June and September offer warm water with lighter beach crowds. In July and August, arrive before noon for easier anchoring offshore.</p>
<p>Morning departures from Limenaria beat afternoon chop on the longer eastbound leg.</p>
<h2>Anchoring offshore</h2>
<p>Drop anchor on sand beyond the swimming zone — typically 4–8 metres depending on tide and crowd. Watch for swimmers and pedal boats near the shore.</p>
<p>Set a stern anchor or bow anchor with adequate scope; east-coast breeze can build after midday. Swim and snorkel only from the swim ladder.</p>
<h2>How many hours to book</h2>
<p>The Golden Beach Run route is priced as a five-hour minimum recommendation — three hours on site after the cruise each way.</p>
<p>Use the <a href="/package">price calculator</a> with five or six hours selected to see live totals for each vessel on <a href="/fleet">boat fleet</a>.</p>
<h3>Stop near Potos on the way</h3>
<p>An offshore anchor near Potos makes a natural lunch-on-board break on the outbound or return leg. View the harbour village from the water while you eat on deck.</p>
<p>Plot Potos and Chrisi Akti together on the <a href="/map">sea atlas</a> to time a full east-coast day.</p>
<h2>What to pack</h2>
<p>Long beach days need extra water, sun hats, packed lunch, and reef-safe sunscreen. A dry bag protects towels and electronics during swim-ladder stops.</p>
<p>Water shoes are optional on soft sand but useful on the marina pontoon and any pebble stops en route.</p>
<h2>Vessel recommendations</h2>
<p>Any 30HP fleet boat completes the run. Day cruisers add shade for the long open-water legs; open boats suit small groups travelling light.</p>
<p>No licence required up to 30HP. <a href="/booking">book online</a> early — east-coast days are popular in peak season.</p>
<h2>Plan your Chrisi Akti day</h2>
<p>Golden Beach rewards renters willing to book enough hours. The sand and turquoise shallows are worth the east-coast cruise — all enjoyed from the boat at anchor.</p>
<p>Check the Golden Beach Run on <a href="/map">sea atlas</a> and confirm your rental through <a href="/booking">book online</a> before your Thassos dates.</p>`,
  },
};

function applyPolicy(text) {
  let result = text;
  for (const [pattern, replacement] of POLICY_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

const ARTICLE_OVERRIDES = {
  "potos-harbor-boat-guide": {
    title: "Potos Bay by Boat — Offshore Anchor on Your Thassos Rental",
    excerpt:
      "Anchor offshore near Potos village on a self-drive rental from Limenaria — swim from the ladder, picnic lunch on board, and how Potos fits the southern-coast and Golden Beach routes on Thassos.",
    content: `<h2>Potos from the water</h2>
<p>Potos is the lively harbour village on Thassos' south-east coast — colourful waterfront, sandy bay, and one of the best midday anchor points on a longer rental day. At Rent A Boat Villy, guests stay on board at all times: you anchor offshore, swim from the swim ladder, and enjoy lunch on the boat.</p>
<p>Allow 50–60 minutes from Limenaria in a 30HP boat following the south shore. Track waypoints on our <a href="/map">sea atlas</a> before you <a href="/booking">book online</a>.</p>
<h2>Offshore anchoring near Potos</h2>
<p>Drop anchor on sand clear of the swimming zone and small craft lanes, 200–400 metres from the village front. Depth is typically 3–6 metres with good holding on sand.</p>
<p>Afternoon breeze can chop the bay — many skippers arrive late morning, enjoy an on-board picnic, then continue east to Aliki or Golden Beach.</p>
<h3>Stay on board policy</h3>
<p>Guests cannot disembark at beaches, harbours, or coves — this is a firm insurance and safety rule at Rent A Boat Villy. Swimming and snorkelling are only from the swim ladder around your anchored boat.</p>
<p>View the Potos waterfront and coastline from the water while you lunch on board. Pack sandwiches, fruit, and drinks in the on-board cooler before departure from Limenaria Marina.</p>
<h2>Picnic lunch at anchor</h2>
<p>Plan your midday meal on the boat — cooler space keeps food and cold drinks fresh. The village tavernas look inviting from offshore, but your lunch happens on deck with harbour views.</p>
<p>Allow 45–60 minutes at anchor for swimming, snorkelling, and eating before continuing east on a full southern-coast day.</p>
<h2>Potos on the south-coast loop</h2>
<p>Classic order: Metalia, Tripiti, Pefkari, lunch on board at anchor near Potos, Aliki afternoon. Six to seven rental hours minimum.</p>
<p>Southern Coast Discovery on <a href="/map">sea atlas</a> lists Potos as a core waypoint with cruise times from each prior stop.</p>
<h3>Golden Beach connection</h3>
<p>Potos sits on the path to Golden Beach (Chrisi Akti). Many east-coast days pause offshore near Potos outbound and return the same way.</p>
<p>Golden Beach Run timing on <a href="/map">sea atlas</a> assumes a calm anchor break near Potos — plan five to six hours total.</p>
<h2>Self-drive reminder</h2>
<p>Rent A Boat Villy provides hourly rental without a guide. You navigate to Potos using GPS tracks and briefing bearings.</p>
<p>Browse <a href="/fleet">boat fleet</a> for a boat with enough range and comfort for the 60-minute open leg.</p>
<h2>Best season</h2>
<p>June and September offer warm water and easier anchoring. August is busiest — arrive before 13:00 for a quieter anchor spot offshore.</p>
<p>Price your day on <a href="/package">price calculator</a> with enough hours — rushing Potos defeats the purpose of a harbour-view anchor stop.</p>
<h2>What to bring on board</h2>
<p>Packed lunch, extra water, reef-safe sunscreen, and a dry bag for phones. Non-slip shoes for the marina pontoon at Limenaria.</p>
<p>Mask and snorkel sets available at marina check-in — explore the clear shallows around your anchor line only from the swim ladder.</p>
<h2>Plan Potos on your route</h2>
<p>Potos from offshore turns a beach-hopping day into a full Greek coast experience — turquoise water, village views, and lunch on board in one stop.</p>
<p><a href="/booking">book online</a> your rental and map Potos on <a href="/map">sea atlas</a> within your south or east-coast plan.</p>`,
  },
  "southern-coast-thassos-boat-itinerary": {
    content: `<h2>The classic south-coast day</h2>
<p>This itinerary is the most requested full-day loop for Rent A Boat Villy guests — west coves in the morning, lunch on board at anchor near Potos, then Aliki ruins before the return to Limenaria Marina.</p>
<p>You drive the boat yourself on an hourly rental. Our Southern Coast Discovery track on the <a href="/map">sea atlas</a> mirrors this GPS path. Guests stay on board at all anchor stops — swimming only from the swim ladder.</p>
<h2>Morning — west coves</h2>
<p>Depart Limenaria at 09:30. First stop Metalia Beach for a snorkel in iron-ore shallows while the south-west wind is still light.</p>
<p>Continue to Tripiti Cave for photos and a swim from the boat ladder near the arch — aim to leave by 11:00 if continuing east.</p>
<h3>Mid-morning timing</h3>
<p>Allow 25 minutes between Metalia and Tripiti, then 20 minutes to Pefkari. Do not linger too long early if Aliki is on your afternoon plan.</p>
<p>Fuel is included on standard hourly rates — focus on time management rather than engine worry.</p>
<h2>Midday — Pefkari and Potos</h2>
<p>Anchor at Pefkari for a sandy swim from the ladder — shallow water ideal for families. Then cruise to an offshore anchor near Potos for lunch on board.</p>
<p>Pack your picnic before departure from Limenaria Marina. Enjoy harbour and coastline views from the water while you eat on deck — no disembarking at Potos or any beach.</p>
<h2>Afternoon — Aliki quarry</h2>
<p>Finish at Aliki Ancient Quarry for history and snorkelling among submerged marble blocks from the boat ladder. View the peninsula ruins from the water — stay on board throughout.</p>
<p>Depart Aliki by 16:30 for a comfortable Limenaria return. Total active time: six to seven rental hours. Use <a href="/package">price calculator</a> with six hours selected to compare vessel totals.</p>
<h3>Wind considerations</h3>
<p>South-coast breeze often builds after 14:00. Eastbound legs to Aliki can feel choppier — secure loose items and plan a steady cruise speed.</p>
<p>If wind is strong, shorten to Metalia–Tripiti–Pefkari and skip Aliki — our team advises at morning briefing.</p>
<h2>Boat choice</h2>
<p>Any 30HP boat on <a href="/fleet">boat fleet</a> handles the loop. Day cruisers suit groups wanting shade on long open legs; open boats suit agile couples.</p>
<p>No licence required up to 30HP. Book six or seven hours in peak season — <a href="/booking">book online</a> early.</p>
<h2>What to pack</h2>
<p>Water, packed lunch, snacks, reef-safe sunscreen. Dry bag for phones during snorkel stops at Metalia and Aliki.</p>
<p>Water shoes help when using the swim ladder at Tripiti and Aliki anchorages.</p>
<h2>Shorter alternatives</h2>
<p>Four hours: Metalia and Tripiti only. Five hours: add Pefkari without Aliki. Match hours to your group energy and weather.</p>
<p>Every waypoint on <a href="/map">sea atlas</a> shows cruise time from Limenaria for custom variants.</p>
<h2>Book the south-coast day</h2>
<p>This loop showcases why Thassos rewards boat renters. One marina departure, five distinct anchor stops, home by sunset — all from the water.</p>
<p><a href="/booking">book online</a> six or seven hours or preview the full track on <a href="/map">sea atlas</a> before you travel.</p>`,
  },
  "aliki-ancient-quarry-from-sea": {
    content: `<h2>Aliki from the water</h2>
<p>Aliki was one of antiquity's most important marble export harbours. Columns destined for temples across the Mediterranean left from this bay — ruins still visible above and below the surface.</p>
<p>The site is best appreciated by rental boat. You anchor offshore, snorkel the submerged blocks from the swim ladder, and view the peninsula coastline from the water.</p>
<h2>Getting there from Limenaria</h2>
<p>Allow 60–75 minutes eastbound along the south coast past Potos. Our southern-coast route on the <a href="/map">sea atlas</a> marks the marine path and suggested anchor zones.</p>
<p>Rent A Boat Villy rentals are self-drive — no guide on board. Briefing covers approach bearings and where to drop anchor safely. Guests stay on board — no disembarking at Aliki or any stop.</p>
<h3>Historical context</h3>
<p>Quarrying at Aliki spanned centuries. Marble was loaded directly onto ancient ships from the twin harbours you still see from the boat.</p>
<p>Protected archaeological status means respectful behaviour — look, photograph, and snorkel from the ladder, but do not remove any stone or artefact.</p>
<h2>Snorkelling the ruins</h2>
<p>Submerged blocks and ancient cuttings lie in 2–4 metres of visibility-clear water. A mask reveals details invisible from the shore.</p>
<p>Mask and snorkel sets are available at Limenaria Marina on request. Calm mornings offer the best underwater clarity. Swim only from the boat ladder.</p>
<h2>Anchoring at Aliki</h2>
<p>Use designated anchorage areas on sand, clear of swimming zones and archaeological markers. Depth is typically 3–5 metres.</p>
<p>Afternoon breeze can chop the bay — many skippers visit Aliki mid-morning on a full southern-coast day before returning via Potos.</p>
<h3>Combine with Potos anchor</h3>
<p>Potos lies west of Aliki — ideal for lunch on board at anchor near the harbour before or after the quarry stop.</p>
<p>Six rental hours fit Aliki, an offshore Potos anchor, and one west-coast cove on the return. Price the day on our <a href="/package">price calculator</a>.</p>
<h2>Planning your rental</h2>
<p>Any 30HP boat in our <a href="/fleet">boat fleet</a> handles the run. Families often prefer a day cruiser for shade during the longer eastbound leg.</p>
<p>Fuel is included for standard Thassos cruising. <a href="/booking">book online</a> early in peak season when daily rentals sell out.</p>
<h2>What to bring</h2>
<p>Reef-safe sunscreen, water, packed lunch, and snacks for on-board meals. A dry bag keeps phones safe during snorkel stops from the swim ladder.</p>
<p>Underwater camera or phone housing rewards patient snorkellers — ancient cut marks are sharp and photogenic in clear water.</p>
<h2>Respect the protected site</h2>
<p>Aliki is a protected zone. Anchor only where indicated, stay out of roped archaeological areas, and leave no litter.</p>
<p>Study the full south-coast loop on <a href="/map">sea atlas</a> and secure your hourly rental via <a href="/booking">book online</a> before your Thassos holiday.</p>`,
  },
};

const NEW_ARTICLES = [
  {
    slug: "boat-rental-safety-stay-on-board",
    category: "rental",
    title: "Boat Rental Safety at Limenaria — Stay On Board Policy",
    excerpt:
      "Essential safety rules for self-drive boat rental at Rent A Boat Villy Limenaria Marina — stay-on-board policy, briefing, life jackets, anchoring, weather, VHF, and why guests cannot disembark at beaches or harbours.",
    content: `<h2>Safety first at Rent A Boat Villy</h2>
<p>Every hourly self-drive rental from Limenaria Marina begins with safety. Rent A Boat Villy is a family-run operation — we want you to enjoy Thassos from the water and return to the marina without incident.</p>
<p>This guide explains our stay-on-board policy, what the briefing covers, and the habits that keep your charter day safe and fun.</p>
<h2>Stay on board — no exceptions</h2>
<p><strong>Guests cannot disembark or be dropped off from the boat at beaches, harbours, or coves.</strong> You must stay on board throughout your rental. This is a firm policy driven by insurance requirements and passenger safety.</p>
<p>Swimming and snorkelling are permitted only from the swim ladder around your anchored boat. Enter and exit the water at the ladder — never swim to shore or climb onto beaches from the vessel.</p>
<p>Lunch and all meals are enjoyed on board. Pack food and drinks in the on-board cooler before departure, or prepare snacks at Limenaria Marina.</p>
<h3>Why this policy exists</h3>
<p>Self-drive rental boats are insured for on-board use and anchored swimming. Allowing guests ashore at multiple stops creates liability, grounding risk, and propeller hazards that we cannot accept.</p>
<p>The policy protects you, other swimmers, and our fleet. It also keeps your day simple — anchor, swim from the ladder, move to the next cove.</p>
<h2>Pre-departure safety briefing</h2>
<p>Arrive 20 minutes before your slot for ID check and a 15–20 minute briefing. We cover vessel controls, kill switch, throttle, steering, anchor setup, and designated cruising areas around Thassos.</p>
<p>First-time skippers receive extra time on docking at the marina wall and anchor technique on sand. Ask every question — local knowledge prevents most first-day mistakes.</p>
<p>GPS tracks for popular routes are shared via our <a href="/map">sea atlas</a>. Browse our <a href="/fleet">boat fleet</a> before you <a href="/booking">book online</a> to match vessel size to your group.</p>
<h2>Life jackets and onboard equipment</h2>
<p>Life jackets for all guests are included on every departure. Children and non-swimmers should wear them whenever the boat is underway and consider wearing them at anchor in choppy conditions.</p>
<p>Each boat carries a kill switch lanyard, anchor with adequate chain and rope, navigation lights, fire extinguisher, bilge pump, and VHF radio where fitted. Briefing explains location and use of each item.</p>
<h3>Swim ladder rules</h3>
<p>Use the swim ladder to enter and exit the water. Never jump from the bow or stern near the propeller. Keep the engine off and kill switch engaged whenever anyone is in the water.</p>
<p>One person should remain on board to watch swimmers at all times. Never snorkel or swim alone — the buddy system applies at every anchor stop.</p>
<h2>Anchor safety</h2>
<p>Drop anchor on sand in 3–6 metres where briefing allows. Set adequate scope for wind shift and watch your swing radius as other boats arrive.</p>
<p>We review anchoring technique during every briefing — sand identification, scope ratio, and how to raise anchor cleanly before departure. Avoid rocky shallows and archaeological zones marked on the <a href="/map">sea atlas</a>.</p>
<p>If anchor drags, restart the engine, circle back, and re-set on sand. Do not attempt to beach the boat at any location.</p>
<h2>Weather and go/no-go decisions</h2>
<p>We monitor forecasts daily from Limenaria Marina. If conditions are unsafe, we reschedule at no cost or refund your deposit in full.</p>
<p>Morning sea state is usually calmest on Thassos. South and west shores are more sheltered than exposed north-coast routes to Marble Beach and Vathi. Our team advises on same-day wind at check-in.</p>
<p>If breeze builds during your rental, shorten your loop and return early. Never push a north-shore plan when meltemi is forecast.</p>
<h2>Propeller and engine rules</h2>
<p>The propeller is the most dangerous part of any rental day. Engine off, kill switch on, and keys removed whenever passengers swim or snorkel.</p>
<p>Before starting the engine, confirm all guests are seated, nothing trails in the water, and the area around the stern is clear. Brief children on staying seated while underway.</p>
<h2>VHF and communication</h2>
<p>Briefing covers basic VHF use — channel 16 for emergency, working channels for marina contact. Our team monitors VHF during operating hours 08:00–20:00, May through October.</p>
<p>Mobile signal varies offshore. Note our marina contact number at check-in. In any doubt, call before attempting a difficult manoeuvre.</p>
<h2>Navigation and cruising zones</h2>
<p>Stay within designated cruising areas explained at briefing. Follow GPS tracks on the <a href="/map">sea atlas</a> — especially on north-coast cliff sections with submerged rocks.</p>
<p>Maintain safe speed near swimmers, anchored boats, and the marina entrance. No licence is required up to 30HP, but responsible speed is mandatory.</p>
<h2>What to pack for a safe day</h2>
<p>Reef-safe sunscreen, hats, non-slip shoes, plenty of water, packed lunch, and a dry bag for phones. Avoid glass bottles on board.</p>
<p>Mask and snorkel sets are available at the marina on request. Bring any prescription medications and a light jacket for breezy returns.</p>
<h2>Book with confidence</h2>
<p>Understanding the stay-on-board policy before charter day prevents disappointment. You still see Thassos' best coves, ruins, and coastline — all from the water, with swims from the ladder at each anchor.</p>
<p><a href="/booking">book online</a> your hourly rental, explore routes on <a href="/map">sea atlas</a>, and choose your boat on <a href="/fleet">boat fleet</a>. We look forward to a safe, memorable day on the Aegean.</p>`,
  },
  {
    slug: "thassos-island-overview",
    category: "thassos",
    title: "Thassos Island Guide — Geography, Culture, and Boat Rental from Limenaria",
    excerpt:
      "Everything you need to know about Thassos island — how to get there, Limenaria, seasons, pine forests, marble history, north vs south coast, and why Rent A Boat Villy at Limenaria Marina is the ideal base for self-drive boat rental.",
    content: `<h2>Thassos in the North Aegean</h2>
<p>Thassos is the northernmost major Greek island in the Aegean Sea — green, mountainous, and ringed by beaches and coves that reward exploration from the water. Unlike barren Cycladic islands, Thassos is covered in pine forests, olive groves, and ancient marble quarries.</p>
<p>For boat renters, the coastline is the main attraction. Road access reaches many beaches, but the quietest anchorages and dramatic sea caves are best reached by rental boat from Limenaria Marina.</p>
<h2>Geography and coastlines</h2>
<p>Thassos is roughly circular, about 26 kilometres across. A mountain ridge runs east-west through the centre, dividing the island into distinct north and south shores.</p>
<p>The south coast faces the mainland — generally calmer, with sandy bays like Pefkari, Potos, and Golden Beach (Chrisi Akti). The south coast around Limenaria offers iron-ore cliffs at Metalia and sea caves at Tripiti.</p>
<p>The north coast is more exposed to meltemi wind but delivers Marble Beach (Saliara), white cliffs, and forest-backed bays like Vathi. Each shore has a different character — plan your rental day accordingly.</p>
<h3>North vs south — which to choose</h3>
<p>First-time renters and families should start on the south and west coasts — Metalia, Tripiti, Pefkari, and offshore anchors near Potos and Aliki. Calmer water and shorter distances from Limenaria Marina.</p>
<p>Experienced skippers on calm mornings can attempt the north-shore Marble Route to Saliara and Kalogria. Check wind at briefing and allow five to six rental hours.</p>
<h2>How to get to Thassos</h2>
<p>Most visitors drive to Keramoti on the mainland and take the frequent ferry to Limenas (Thassos Town) — roughly 45 minutes. From Limenas, Limenaria is 40 minutes south by car or bus.</p>
<p>The nearest airport is Kavala (KVA) on the mainland, about 30 minutes from Keramoti ferry port. Thessaloniki airport is a longer but viable option for international flights.</p>
<p>Once on Thassos, Limenaria sits on the west coast — close to Metalia, Tripiti, and the southern-coast routes that Rent A Boat Villy guests use most.</p>
<h2>Limenaria — your boat rental base</h2>
<p>Limenaria is a harbour town on Thassos' west coast with a working marina, tavernas on the waterfront, and easy parking. Rent A Boat Villy operates daily self-drive hourly rentals from Limenaria Marina, May through October.</p>
<p>From here you reach Metalia Beach in 10–15 minutes, Tripiti Cave in 30 minutes, and the full southern-coast loop to Aliki in six to seven hours. No other base on Thassos offers this range of boat-accessible destinations so quickly.</p>
<p>Arrive 20 minutes before your slot for briefing. Browse our <a href="/fleet">boat fleet</a> and <a href="/booking">book online</a> before you travel.</p>
<h2>Seasons and when to visit</h2>
<p>Peak season is July and August — warmest water, busiest beaches, and highest demand for boat rentals. Book 48 hours ahead for popular vessels and sunset slots.</p>
<p>June and September are ideal for boat rental — warm sea temperatures, lighter crowds, and more forgiving wind on north-coast days. May and October offer cooler water but excellent value and space at anchor.</p>
<p>Operating season for Rent A Boat Villy is May through October, 08:00–20:00 daily. Weather cancellations are rescheduled or fully refunded.</p>
<h2>Culture and history</h2>
<p>Thassos was wealthy in antiquity thanks to marble, timber, and gold. The ancient quarry at Aliki — reachable by rental boat from Limenaria — exported columns across the Mediterranean. Submerged ruins are still visible to snorkellers from the boat ladder.</p>
<p>Traditional villages like Theologos and Kazaviti preserve stone architecture and mountain atmosphere inland. From the boat, you view coastal settlements like Potos and Aliki from the water while staying on board at anchor.</p>
<h3>Marble and pine — the island's identity</h3>
<p>Thassos white marble was famous throughout the ancient world — Marble Beach (Saliara) on the north shore shows raw scree tumbling into emerald water. Pine forests reach the shore in many bays, giving Thassos a scent and shade rare among Greek islands.</p>
<p>Respect protected archaeological zones at Aliki and coastal nature. Take all rubbish back to Limenaria Marina after your rental day.</p>
<h2>Why boat rental from Limenaria is ideal</h2>
<p>Limenaria Marina sits centrally on the west coast — equidistant from south-coast highlights and within reach of north-shore Marble Beach on longer charters. You drive the boat yourself after briefing; no licence needed up to 30HP.</p>
<p>Hourly rental with fuel included on standard cruising lets you match hours to your plan. Use our <a href="/map">sea atlas</a> for GPS tracks, distances, and cruise times from Limenaria to every major stop.</p>
<p>Guests stay on board at all anchor stops — swim from the swim ladder, lunch on deck, view beaches and harbours from the water. This policy keeps rental safe, simple, and insured.</p>
<h2>Planning your Thassos boat day</h2>
<p>Four hours: Metalia and Tripiti west loop. Six hours: full southern coast with Aliki. Five hours: Golden Beach Run to Chrisi Akti. Five to six hours: Marble Cliffs north route.</p>
<p>Price any combination on the <a href="/package">price calculator</a>. Choose your vessel on <a href="/fleet">boat fleet</a> and confirm on <a href="/booking">book online</a>.</p>
<h2>Start exploring Thassos</h2>
<p>Thassos rewards renters who plan from the water. Limenaria Marina is the launch pad — pine-scented island, marble history, and Aegean coves waiting offshore.</p>
<p>Map your first route on <a href="/map">sea atlas</a> and <a href="/booking">book online</a> your Rent A Boat Villy hourly rental before peak summer weeks fill up.</p>`,
  },
];

for (const article of articles) {
  if (ARTICLE_OVERRIDES[article.slug]) {
    Object.assign(article, ARTICLE_OVERRIDES[article.slug]);
  }
  if (ARTICLE_CONTENT_OVERRIDES[article.slug]) {
    Object.assign(article, ARTICLE_CONTENT_OVERRIDES[article.slug]);
  }
  article.title = applyPolicy(article.title);
  article.excerpt = applyPolicy(article.excerpt);
  article.content = applyPolicy(article.content);
}

const existingSlugs = new Set(articles.map((a) => a.slug));
for (const article of NEW_ARTICLES) {
  if (!existingSlugs.has(article.slug)) {
    articles.push(article);
  }
}

writeFileSync(enPath, JSON.stringify(articles, null, 2) + "\n");
console.log("Updated en.json:", articles.length, "articles");
