/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const configurations = app.findCollectionByNameOrId("pbc_655248580")

  // filenames fallback (matches mocks/img/configurations)
  let files = [
    "1.png","2plie.png","3.png","4.png","5.png","a.png","angle_droit.png",
    "bec_canard_ferme.png","bec_canard_ouvert.png","bec_oiseau_3_doigts_ferme.png",
    "bec_oiseau_3_doigts_ouvert.png","bec_oiseau_ferme.png","bec_oiseau_ouvert.png",
    "c.png","clef.png","cornes.png","crochet.png","griffe.png","i.png","index.png",
    "j.png","k.png","l.png","main_plate.png","majeur_plie.png","moufle.png","o.png",
    "petite_griffe.png","pince_ronde.png","pince.png","pouce_majeur.png","s.png",
    "u.png","v.png","volley.png","x.png"
  ];

  const dir = $filepath.join($os.getwd(), 'pb_assets', 'img', 'configurations');

  // use real files if present
  // if (fs.existsSync(dir)) {
  //   const real = fs.readdirSync(dir).filter(f => /\.(png|jpe?g|gif)$/i.test(f));
  //   if (real.length) files = real;
  // }

  for (const filename of files) {
    const localPath = $filepath.join(dir, filename);
    const base = filename.replace(/\.[^.]+$/, "");
    const name = base.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    let record = new Record(configurations)
    record.set("name", name)

    let file = $filesystem.fileFromPath(localPath)
    record.set("illustration", file)

    app.save(record)
  }

}, (app) => {
})
