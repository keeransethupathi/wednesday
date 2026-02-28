import streamlit as st

st.set_page_config(
    page_title="Drug Extractor & Disease Mapper",
    page_icon="💊",
    layout="wide",
    initial_sidebar_state="collapsed",
)

def main():
    st.title("💊 Drug Extractor & Disease Mapper")
    st.markdown("Paste a medical paragraph below to automatically extract drug names and match them to their related diseases and indications.")
    st.divider()
    
    # Comprehensive standalone dictionary mapping
    # Contains a broad set of common critical care, general ward, and outpatient drugs
    DRUG_DISEASE_DB = {
        # Vasopressors / Inotropes -> Shock / Hypotension
        "norepinephrine": "Shock / Severe Hypotension",
        "epinephrine": "Anaphylaxis / Cardiac Arrest / Shock",
        "dopamine": "Heart Failure / Shock",
        "dobutamine": "Heart Failure / Cardiogenic Shock",
        "vasopressin": "Vasodilatory Shock / Diabetes Insipidus",
        "phenylephrine": "Hypotension",
        "milrinone": "Heart Failure",
        
        # Antibiotics -> Infections
        "amoxicillin": "Bacterial Infection",
        "augmentin": "Bacterial Infection",
        "azithromycin": "Bacterial Infection (e.g. Pneumonia)",
        "ceftriaxone": "Severe Bacterial Infection",
        "vancomycin": "MRSA / Severe Gram-positive Infection",
        "piperacillin": "Pseudomonal / Severe Infection",
        "tazobactam": "Severe Infection (Beta-lactamase inhibitor)",
        "meropenem": "Severe / Resistant Bacterial Infection",
        "cefepime": "Pseudomonal / Severe Infection",
        "metronidazole": "Anaerobic Infection",
        "ciprofloxacin": "Bacterial Infection",
        "levofloxacin": "Bacterial Infection",
        
        # Cardiovascular / Antihypertensives -> Hypertension / Heart Disease
        "lisinopril": "Hypertension / Heart Failure",
        "losartan": "Hypertension",
        "amlodipine": "Hypertension / Angina",
        "metoprolol": "Hypertension / Angina / Heart Failure",
        "carvedilol": "Heart Failure / Hypertension",
        "diltiazem": "Hypertension / Arrhythmia (Afib)",
        "amiodarone": "Arrhythmia (Afib/VT/VF)",
        "atorvastatin": "Hyperlipidemia / Cardiovascular Disease",
        "rosuvastatin": "Hyperlipidemia",
        "clopidogrel": "Coronary Artery Disease / Stroke prevention",
        "aspirin": "Coronary Artery Disease / Stroke prevention",
        "heparin": "Deep Vein Thrombosis / Pulmonary Embolism (DVT/PE)",
        "enoxaparin": "DVT/PE",
        "warfarin": "Atrial Fibrillation / DVT/PE",
        "apixaban": "Atrial Fibrillation / DVT/PE",
        "rivaroxaban": "Atrial Fibrillation / DVT/PE",

        # Respiratory -> Asthma / COPD
        "albuterol": "Asthma / COPD (Bronchospasm)",
        "ipratropium": "COPD / Asthma",
        "fluticasone": "Asthma / COPD",
        "budesonide": "Asthma / COPD",
        "salmeterol": "Asthma / COPD",
        "formoterol": "Asthma / COPD",
        
        # Diabetics -> Diabetes Mellitus
        "metformin": "Diabetes Mellitus Type 2",
        "insulin": "Diabetes Mellitus",
        "glipizide": "Diabetes Mellitus Type 2",
        "empagliflozin": "Diabetes Mellitus Type 2 / Heart Failure",
        "sitagliptin": "Diabetes Mellitus Type 2",
        
        # Neuro / Psych / Analgesics -> Pain / Seizures / Psych
        "acetaminophen": "Pain / Fever",
        "paracetamol": "Pain / Fever",
        "ibuprofen": "Pain / Inflammation",
        "ketorolac": "Severe Pain",
        "morphine": "Severe Pain",
        "fentanyl": "Severe Pain / Anesthesia",
        "oxycodone": "Moderate to Severe Pain",
        "propofol": "Anesthesia / Sedation",
        "midazolam": "Sedation / Anxiety / Seizures",
        "dexmedetomidine": "ICU Sedation",
        "levetiracetam": "Seizures / Epilepsy",
        "phenytoin": "Seizures / Epilepsy",
        "valproate": "Seizures / Bipolar Disorder",
        "gabapentin": "Neuropathic Pain / Seizures",
        "haloperidol": "Delirium / Schizophrenia",
        "quetiapine": "Bipolar Disorder / Schizophrenia",
        "fluoxetine": "Depression",
        "sertraline": "Depression / Anxiety",
        
        # GI / Renal -> Ulcers / Kidney
        "pantoprazole": "GERD / Peptic Ulcer Disease",
        "omeprazole": "GERD / Peptic Ulcer Disease",
        "furosemide": "Edema / Heart Failure",
        "spironolactone": "Heart Failure / Ascites",
        "ondansetron": "Nausea / Vomiting",
        
        # Steroids
        "prednisone": "Inflammation / Autoimmune Disease",
        "dexamethasone": "Severe Inflammation / Brain Edema",
        "hydrocortisone": "Adrenal Insufficiency / Septic Shock"
    }

    user_text = st.text_area("Input Medical Text Here:", height=200, placeholder="e.g. The patient presented with hypertension and was started on lisinopril and amlodipine. Given their history of afib, apixaban was continued...")
    
    if st.button("Extract Drugs", type="primary"):
        if not user_text.strip():
            st.warning("Please enter some text to extract drugs from.")
        else:
            import re
            
            # Simple extraction mechanism:
            # 1. Clean the text (remove punctuation, split by words)
            # 2. Match words against our library directly
            
            # strip out common punctuation to isolate words properly
            cleaned_text = re.sub(r'[\.,/#!$%\^&\*;:{}=\-_`~()\[\]]', ' ', user_text.lower())
            words = cleaned_text.split()
            
            # Use a set to capture unique drugs matched
            extracted_results = []
            seen_drugs = set()
            
            for word in words:
                if word in DRUG_DISEASE_DB and word not in seen_drugs:
                    seen_drugs.add(word)
                    extracted_results.append({
                        "Detected Drug": word.capitalize(),
                        "Related Disease / Indication": DRUG_DISEASE_DB[word]
                    })
            
            if extracted_results:
                st.success(f"Found {len(extracted_results)} drug(s) in the text!")
                st.dataframe(extracted_results, use_container_width=True, hide_index=True)
            else:
                st.info("No common drugs from our database were detected in the text. Try using generic names (e.g., 'lisinopril' instead of 'Prinivil').")

if __name__ == "__main__":
    main()
