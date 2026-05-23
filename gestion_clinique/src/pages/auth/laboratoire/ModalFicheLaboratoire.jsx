import { C, Overlay, CloseBtn, Btn, getAge, fmt } from "./shared.jsx"

export default function ModalFicheLaboratoire({ demande, onClose }) {
  const estAnormal = (valeur, norme) => {
    if (!valeur || !norme || !norme.includes("-")) return false
    const [min, max] = norme.split("-").map(Number)
    const v = parseFloat(valeur)
    return !isNaN(v) && !isNaN(min) && !isNaN(max) && (v < min || v > max)
  }

  const handlePrint = () => {
    const dateEdit = new Date().toLocaleDateString("fr-FR")
    const numRef   = `LAB-${demande.id}`
    const nomParts = (demande.patient.nom || "").split(" ")
    const prenom   = nomParts[0] || ""
    const nom      = nomParts.slice(1).join(" ") || ""
    const age      = getAge(demande.patient.dateNaissance)
    const prescripteur = demande.medecinPrescripteur || ""
    const service      = demande.service || ""

    const css = `
      @page { size:A4; margin:10mm 12mm; }
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;}
      .page{page-break-after:always;min-height:257mm;display:flex;flex-direction:column;}
      .page:last-child{page-break-after:avoid;}
      .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:10px;}
      .hdr-left{font-size:10.5px;line-height:1.55;}
      .hdr-logo{font-size:13px;font-weight:bold;margin-bottom:2px;}
      .hdr-logo span{font-style:italic;color:#005a8e;}
      .hdr-right table{border-collapse:collapse;}
      .hdr-right td{border:1px solid #555;padding:3px 10px;font-size:10px;min-width:90px;}
      .hdr-right td:first-child{font-weight:bold;background:#f0f0f0;width:60px;}
      .section-title{text-align:center;margin:8px 0 10px;line-height:1.5;}
      .section-title .labo{font-size:13px;font-weight:bold;text-decoration:underline;}
      .section-title .type{font-size:12px;font-style:italic;}
      .pat-box{border:1px solid #555;padding:0;margin-bottom:12px;}
      .pat-row{display:flex;}
      .pat-cell{flex:1;padding:4px 8px;border-right:1px solid #ccc;font-size:10.5px;}
      .pat-cell:last-child{border-right:none;}
      .pat-cell b{display:inline-block;min-width:70px;}
      table.res{width:100%;border-collapse:collapse;margin-bottom:12px;}
      table.res th,table.res td{border:1px solid #555;padding:5px 7px;font-size:10.5px;vertical-align:middle;}
      table.res th{background:#e8e8e8;font-weight:bold;text-align:center;}
      .anormal{color:#cc0000;font-weight:bold;}
      .positif{color:#cc0000;}
      .negatif{color:#007700;}
      .footer-sig{margin-top:auto;padding-top:16px;text-align:right;font-size:11px;border-top:1px solid #bbb;}
      .interp{font-size:9.5px;margin-top:6px;border:1px solid #aaa;padding:6px 10px;background:#fafafa;}
      .interp-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;}
    `

    const hdr = (typeAnalyse) => `
      <div class="hdr">
        <div class="hdr-left">
          <div class="hdr-logo"><strong>CABINET MEDICAL</strong> <span>Marouane</span></div>
          <div>Dr DOUMBOUYA Mamoudou</div>
          <div>Médecin Généraliste RG</div>
          <div>Tel : (+224)664-29-04-31 / 620-62-55-98</div>
          <div>E-mail : amoudymtha@gmail.com</div>
        </div>
        <div class="hdr-right">
          <table><tr><td>Date</td><td>${dateEdit}</td></tr>
          <tr><td>Reçu N°</td><td>${numRef}</td></tr>
          <tr><td>Montant</td><td></td></tr></table>
        </div>
      </div>
      <div class="section-title">
        <div class="labo">Laboratoire d'Analyse Bio Médicale</div>
        <div class="type">${typeAnalyse}</div>
      </div>
      <div class="pat-box">
        <div class="pat-row" style="border-bottom:1px solid #ccc;">
          <div class="pat-cell"><b>N° :</b> ${numRef}</div>
          <div class="pat-cell"><b>Effectué le :</b> ${fmt(demande.datePrelevement)||dateEdit}</div>
        </div>
        <div class="pat-row" style="border-bottom:1px solid #ccc;">
          <div class="pat-cell"><b>Nom :</b> ${nom}</div>
          <div class="pat-cell"><b>Édité le :</b> ${dateEdit}</div>
        </div>
        <div class="pat-row" style="border-bottom:1px solid #ccc;">
          <div class="pat-cell"><b>Prénom :</b> ${prenom}</div>
          <div class="pat-cell"><b>Prescripteur :</b> ${prescripteur}</div>
        </div>
        <div class="pat-row">
          <div class="pat-cell"><b>Age :</b> ${age} ans</div>
          <div class="pat-cell"><b>Service :</b> ${service}</div>
        </div>
      </div>`

    const footSig = () => `
      <div class="footer-sig">Le Biologiste Responsable du Laboratoire</div>`

    const tGeneric = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => {
        const an = estAnormal(d.valeur, d.norme)
        return `<tr>
          <td>${p}</td>
          <td class="${an?"anormal":""}" style="text-align:center;">${d.valeur||"—"}</td>
          <td style="text-align:center;">${d.unite||"—"}</td>
          <td>${d.norme||"—"}</td>
        </tr>`
      }).join("")
      return `<table class="res"><thead><tr>
        <th>Paramètre</th><th>Résultat</th><th>Unité</th><th>Valeur de Référence</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tHematologie = (valeurs) => {
      const refH = { GB:"4-12",LYM:"0.8-4.5",MON:"0.1-1.5",GRA:"2-7",GR:"3.5-6.0",HB:"13.0-17.5",HCT:"37-54",VGM:"80-100",TCMH:"27-34",CCMH:"32-36",PLT:"100-400" }
      const refF = { GB:"4-12",LYM:"0.8-4.5",MON:"0.1-1.5",GRA:"2-7",GR:"3.1-5.1",HB:"11.5-16.5",HCT:"36-46",VGM:"80-100",TCMH:"27-34",CCMH:"32-36",PLT:"150-450" }
      const refN = { GB:"4-12",LYM:"2-11.2",MON:"0.40-3.10",GRA:"1.00-8.50",GR:"3.9-6.1",HB:"13.5-20.5",HCT:"43-63.5",VGM:"96.5-120",TCMH:"31-37",CCMH:"30-36",PLT:"200-450" }
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td>${p}</td>
        <td style="text-align:center;font-weight:bold;">${d.valeur||""}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td style="text-align:center;">${refN[p]||d.norme||""}</td>
        <td style="text-align:center;">${refH[p]||""}</td>
        <td style="text-align:center;">${refF[p]||""}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultat Hématologie (Cyan Hématologie)</div>
      <table class="res"><thead><tr>
        <th>Paramètres</th><th>Résultats</th><th>Unités</th>
        <th colspan="3">Valeurs de référence</th>
      </tr><tr>
        <th></th><th></th><th></th>
        <th>Normales</th><th>Homme</th><th>Femme</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <p style="font-size:9px;margin-top:4px;font-style:italic;">NB : les résultats normaux de l'hémogramme peuvent varier en fonction de l'âge, du sexe et des conditions physiologiques.</p>`
    }

    const tSerologie = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => {
        return `<tr>
          <td>${p}</td>
          <td class="${d.valeur&&d.valeur.toLowerCase().includes("négatif")?"negatif":"positif"}" style="text-align:center;">${d.valeur||"—"}</td>
          <td style="text-align:center;">${d.titre||""}</td>
          <td>${d.norme||"—"}</td>
        </tr>`
      }).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">FICHE DES RESULTATS : SEROLOGIQUE</div>
      <table class="res"><thead><tr>
        <th>Analyse demandée</th><th>Résultat</th><th>Titre</th><th>Valeur Normale</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <div class="interp"><div style="font-weight:bold;margin-bottom:4px;text-decoration:underline;">INTERPRETATION DES RESULTATS</div>
      <div class="interp-grid">
        <div>RPR+ TPHA+ : <b>SYPHILIS</b></div><div>RPR− TPHA− : absence d'infection syphilis</div>
        <div>TO+ TH+ : <b>Typhoïde</b></div><div>TO− TH− : pas de typhoïde</div>
        <div>TO+ TH− : Début de typhoïde</div><div>TO− TH+ : Trace (T=200)</div>
      </div></div>`
    }

    const tImmunologieHep = (valeurs) => {
      let no = 1
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td style="text-align:center;">${no++}</td>
        <td>${p}<br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;" class="${d.valeur&&d.valeur.toLowerCase().includes("négatif")?"negatif":"positif"}">${d.valeur||"—"}${d.vt?` VT : ${d.vt}`:""}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td>${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats – Immunologie</div>
      <table class="res"><thead><tr>
        <th>N°</th><th>Recherche demandée</th><th>Résultats</th><th>Unité</th><th>Interprétation</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tHormonal = (valeurs) => {
      let no = 1
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td style="text-align:center;">${no++}</td>
        <td><b>${p}</b><br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;">${d.valeur||"—"}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td style="font-size:10px;">${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultat de l'analyse Hormonal</div>
      <table class="res"><thead><tr>
        <th>N°</th><th>Paramètre</th><th>Résultat</th><th>Unité</th><th>Valeurs Normales</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tThyroide = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td><b>${p}</b><br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;">${d.valeur||"—"}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td>${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats – Hormones Thyroïdiennes</div>
      <table class="res"><thead><tr>
        <th>Recherche demandée</th><th>Résultat</th><th>Unité</th><th>Interprétation (VN)</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tMarqueurs = (valeurs) => {
      let no = 1
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td style="text-align:center;">${no++}</td>
        <td><b>${p}</b><br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;">${d.valeur||"—"}</td>
        <td style="text-align:center;">${d.unite||""}</td>
        <td>${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats des Marqueurs Tumoraux</div>
      <table class="res"><thead><tr>
        <th>N°</th><th>Recherche demandée</th><th>Résultats</th><th>Unités</th><th>Interprétation (VN)</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    }

    const tBHCG = (valeurs) => {
      const val = Object.values(valeurs)[0]
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultat de l'analyse du BHCG Quantitatif</div>
      <table class="res" style="margin-bottom:10px;"><thead><tr>
        <th>Paramètre</th><th>Résultat</th><th>Unité</th>
      </tr></thead><tbody><tr>
        <td>βHCG – Chaîne bêta de l'hormone chorionique gonadotrope<br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;">${val?.valeur||"—"}</td>
        <td style="text-align:center;">${val?.unite||"mUI/L"}</td>
      </tr></tbody></table>
      <table class="res" style="font-size:10px;"><thead>
        <tr><th colspan="2">Interprétation (VN) – Taux de βHCG selon semaine de grossesse</th></tr>
        <tr><th>Jour / Semaine de grossesse</th><th>Taux de βHCG (mUI/L)</th></tr>
      </thead><tbody>
        <tr><td>Pas de grossesse</td><td>˂ 5</td></tr>
        <tr><td>7 jours</td><td>5 – 20</td></tr>
        <tr><td>2e Semaine</td><td>100 – 6 000</td></tr>
        <tr><td>3e Semaine</td><td>1 500 – 25 000</td></tr>
        <tr><td>4e Semaine</td><td>2 400 – 70 000</td></tr>
        <tr><td>5e Semaine</td><td>10 000 – 130 000</td></tr>
        <tr><td>6e Semaine</td><td>30 000 – 190 000</td></tr>
        <tr><td>2–3 mois</td><td>30 000 – 100 000</td></tr>
        <tr><td>7–9 mois</td><td>5 000 – 15 000</td></tr>
      </tbody></table>`
    }

    const tPSA = (valeurs) => {
      const val = Object.values(valeurs)[0]
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats – Cancérologie (Antigène Spécifique Prostatique)</div>
      <p style="margin-bottom:8px;">T.P.S.A Total : <b>${val?.valeur||"—"} ng/ml</b> &nbsp;&nbsp; (E.L.F.A – système Vidas : Biomerieux)</p>
      <table class="res" style="font-size:10px;"><thead>
        <tr><th colspan="2">Valeurs normales par tranche d'âge</th></tr>
        <tr><th>Tranche d'âge</th><th>VN (ng/ml)</th></tr>
      </thead><tbody>
        <tr><td>Moins de 40 ans</td><td>0.21 – 1.72</td></tr>
        <tr><td>40 – 49 ans</td><td>0.27 – 2.19</td></tr>
        <tr><td>50 – 59 ans</td><td>0.27 – 3.42</td></tr>
        <tr><td>60 – 69 ans</td><td>0.22 – 6.16</td></tr>
        <tr><td>Plus de 69 ans</td><td>0.91 – 6.77</td></tr>
      </tbody></table>
      <p style="font-size:9px;margin-top:6px;font-style:italic;">NB : Résultat à confronter toujours avec celui du toucher rectal et aux données cliniques du patient.</p>`
    }

    const tTORCH = (valeurs) => {
      let no = 1
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td style="text-align:center;">${no++}</td>
        <td>${p}<br><span style="font-size:9px;font-style:italic;">(E.L.F.A – système Vidas : Biomerieux)</span></td>
        <td style="text-align:center;font-weight:bold;" class="${d.valeur&&d.valeur.toLowerCase().includes("négatif")?"negatif":"positif"}">${d.valeur||"—"}</td>
        <td style="text-align:center;">${d.unite||"UI/ml"}</td>
        <td style="font-size:9.5px;">${d.norme||"—"}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultats – Immunologie (Toxoplasmose / Rubéole)</div>
      <table class="res"><thead><tr>
        <th>N°</th><th>Recherche demandée</th><th>Résultats</th><th>Unités</th><th>Interprétation</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <div class="interp"><div style="font-weight:bold;margin-bottom:3px;">Interprétation Toxoplasmose / Rubéole :</div>
        <div>IgG− IgM− : Pas d'infection ni immunité — Suivi sérologique mensuel</div>
        <div>IgG− IgM+ : Infection récente — contrôle après 15 jours</div>
        <div>IgG+ IgM− : Infection pré-conceptionnelle (immunité)</div>
        <div>IgG+ IgM+ : Probable évolution d'infection — confirmer par avidité IgG</div>
      </div>`
    }

    const tECBU = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td>${p}</td><td style="text-align:center;">${d.valeur||""}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Examen Cyto-Bactériologique des Urines (ECBU + ATG)</div>
      <table class="res" style="margin-bottom:10px;"><thead><tr>
        <th>Cytologie</th><th>Résultat</th>
      </tr></thead><tbody>${rows}</tbody></table>
      <p style="font-size:10px;margin:8px 0 4px;font-weight:bold;">Coloration de Gram :</p>
      <div style="border:1px solid #aaa;padding:6px;font-size:10px;min-height:30px;"></div>`
    }

    const tParasitologie = (valeurs) => {
      const rows = Object.entries(valeurs).map(([p, d]) => `<tr>
        <td>${p}</td><td style="text-align:center;">${d.valeur||""}</td>
      </tr>`).join("")
      return `<div style="text-align:center;font-weight:bold;font-size:12px;margin-bottom:6px;text-decoration:underline;">Résultat Parasitologique des Selles</div>
      <table class="res"><thead>
        <tr><th colspan="2">Examen Macroscopique</th></tr>
      </thead><tbody>${rows}</tbody></table>`
    }

    const genSection = (nomExamen, data) => {
      const v = data.valeurs || {}
      const n = nomExamen.toLowerCase()
      if (n.includes("nfs") || (n.includes("hématologie") && !n.includes("hormones")))
        return [nomExamen, tHematologie(v)]
      if (n.includes("sérologie") || n.includes("aslo") || n.includes("widal") || n.includes("cpr") || n.includes("rpr") || n.includes("tpha"))
        return [nomExamen, tSerologie(v)]
      if (n.includes("aghbs") || n.includes("hépatite"))
        return [nomExamen, tImmunologieHep(v)]
      if (n.includes("torch") || n.includes("toxoplasmose") || n.includes("rubéole"))
        return [nomExamen, tTORCH(v)]
      if (n.includes("thyroïdien") || n.includes("tsh") || n.includes("t3") || n.includes("t4"))
        return [nomExamen, tThyroide(v)]
      if (n.includes("hormonal") || n.includes("testostérone") || n.includes("prolactine") || n.includes("fsh") || n.includes("œstradiol"))
        return [nomExamen, tHormonal(v)]
      if (n.includes("marqueurs") || n.includes("ca-125") || n.includes("ca-19") || n.includes("ace") || n.includes("ca-15"))
        return [nomExamen, tMarqueurs(v)]
      if (n.includes("psa") || n.includes("prostate"))
        return [nomExamen, tPSA(v)]
      if (n.includes("bhcg") || n.includes("βhcg"))
        return [nomExamen, tBHCG(v)]
      if (n.includes("ecbu") || n.includes("urine") || n.includes("vaginal"))
        return [nomExamen, tECBU(v)]
      if (n.includes("parasitologie") || n.includes("selles"))
        return [nomExamen, tParasitologie(v)]
      return [nomExamen, tGeneric(v, nomExamen)]
    }

    const pages = Object.entries(demande.resultats || {}).map(([nomExamen, data]) => {
      const [typeLabel, contenu] = genSection(nomExamen, data)
      return `<div class="page">${hdr(typeLabel)}${contenu}${footSig()}</div>`
    })

    if (pages.length === 0) {
      alert("Aucun résultat à imprimer.")
      return
    }

    const html = `<!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8">
      <title>Résultats — ${demande.patient.nom}</title>
      <style>${css}</style>
    </head><body>${pages.join("")}</body></html>`

    const w = window.open("", "_blank")
    if (!w) { alert("Autoriser les pop-ups pour imprimer."); return }
    w.document.write(html); w.document.close()
    setTimeout(() => { w.print() }, 500)
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:"100%", maxWidth:860, maxHeight:"92vh", overflow:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:"1px solid "+C.border, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:17, fontWeight:800, color:C.textPri }}>Fiche de résultats — Laboratoire</p>
            <p style={{ fontSize:13, color:C.textSec, marginTop:2 }}>{demande.patient.nom} · {demande.patient.pid}</p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={handlePrint} variant="success" small>Imprimer</Btn>
            <CloseBtn onClose={onClose} />
          </div>
        </div>
        <div style={{ padding:"28px 36px", background:"#fff" }}>
          <div style={{ textAlign:"center", borderBottom:"2px solid "+C.green, paddingBottom:16, marginBottom:22 }}>
            <p style={{ fontSize:20, fontWeight:900, color:C.green }}>CLINIQUE ABC MAROUANE</p>
            <p style={{ fontSize:13, color:C.textSec }}>Service de Laboratoire d'Analyses Médicales</p>
            <p style={{ fontSize:12, color:C.textMuted }}>Conakry, Guinée · cabinet.marouane@clinique.gn</p>
          </div>
          <div style={{ background:C.slateSoft, padding:16, borderRadius:10, marginBottom:22, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, fontSize:13 }}>
            {[
              ["Nom", demande.patient.nom],
              ["N° Dossier", demande.patient.pid],
              ["Âge / Sexe", getAge(demande.patient.dateNaissance)+" ans / "+(demande.patient.sexe==="F"?"Féminin":"Masculin")],
              ["Médecin prescripteur", demande.medecinPrescripteur],
              ["Date prélèvement", fmt(demande.datePrelevement)+" à "+(demande.heurePrelevement||"—")],
              ["Date rendu", fmt(demande.dateRendu)+" à "+(demande.heureRendu||"—")],
            ].map(([label, val]) => <p key={label}><strong>{label} :</strong> {val}</p>)}
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:C.slateSoft }}>
                {["Examen","Paramètre","Résultat","Unité","Référence","Statut"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", border:"1px solid "+C.border }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(demande.resultats||{}).length===0
                ? <tr><td colSpan={6} style={{ padding:24, textAlign:"center", color:C.textMuted, border:"1px solid "+C.border }}>Aucun résultat saisi</td></tr>
                : Object.entries(demande.resultats||{}).map(([nomExamen, data]) =>
                    Object.entries(data.valeurs||{}).map(([param, d], i, arr) => {
                      const anormal = (() => {
                        if (!d.valeur||!d.norme||!d.norme.includes("-")) return false
                        const [mn,mx]=d.norme.split("-").map(Number); const v=parseFloat(d.valeur)
                        return !isNaN(v)&&!isNaN(mn)&&!isNaN(mx)&&(v<mn||v>mx)
                      })()
                      return (
                        <tr key={param} style={{ background:anormal?"#fff5f5":"white" }}>
                          {i===0&&<td rowSpan={arr.length} style={{ padding:"10px 12px", fontWeight:700, color:C.blue, verticalAlign:"top", border:"1px solid "+C.border }}>{nomExamen}</td>}
                          <td style={{ padding:"10px 12px", border:"1px solid "+C.border }}>{param}</td>
                          <td style={{ padding:"10px 12px", fontWeight:700, color:anormal?C.red:C.green, border:"1px solid "+C.border }}>{d.valeur||"—"}</td>
                          <td style={{ padding:"10px 12px", color:C.textSec, border:"1px solid "+C.border }}>{d.unite||"—"}</td>
                          <td style={{ padding:"10px 12px", color:C.textSec, border:"1px solid "+C.border }}>{d.norme||"—"}</td>
                          <td style={{ padding:"10px 12px", border:"1px solid "+C.border }}>
                            {anormal
                              ? <span style={{ display:"inline-flex",alignItems:"center",gap:4,color:C.red,fontWeight:700 }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                                  Anormal
                                </span>
                              : <span style={{ display:"inline-flex",alignItems:"center",gap:4,color:C.green }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  Normal
                                </span>}
                          </td>
                        </tr>
                      )
                    })
                  )
              }
            </tbody>
          </table>
          {Object.entries(demande.resultats||{}).some(([,d])=>d.commentaire)&&(
            <div style={{ marginTop:18 }}>
              {Object.entries(demande.resultats||{}).map(([nom,d])=>d.commentaire?(
                <div key={nom} style={{ marginBottom:8, padding:"10px 14px", background:C.slateSoft, borderRadius:8, fontSize:13 }}><strong>{nom} :</strong> {d.commentaire}</div>
              ):null)}
            </div>
          )}
          {demande.commentaireGlobal&&(
            <div style={{ marginTop:16, padding:"12px 16px", background:C.blueSoft, borderRadius:8, fontSize:13 }}><strong>Conclusion :</strong> {demande.commentaireGlobal}</div>
          )}
          <div style={{ marginTop:40, display:"flex", justifyContent:"flex-end" }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:13, color:C.textSec, marginBottom:40 }}>{demande.validePar?`Validé par ${demande.validePar} le ${demande.valideLe}`:"En attente de validation"}</p>
              <div style={{ width:160, height:70, border:"1px dashed "+C.border, borderRadius:8 }}/>
              <p style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>Signature et cachet</p>
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  )
}
