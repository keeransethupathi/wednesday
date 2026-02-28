import streamlit as st
import datetime

st.set_page_config(
    page_title="SOFA Score Calculator",
    page_icon="⚕️",
    layout="wide",
    initial_sidebar_state="expanded",
)

def main():
    # Custom CSS to wrap segmented control items so they fit the container width
    st.markdown("""
        <style>
        /* Target the internal container of the segmented control to wrap its items */
        div[data-testid="stSegmentedControl"] > div {
            flex-wrap: wrap;
            gap: 10px;
        }
        
        /* Make the container full width */
        div[data-testid="stSegmentedControl"] {
            width: 100%;
        }
        </style>
    """, unsafe_allow_html=True)

    st.title("⚕️ Medical Calculator & Tools")
    
    # Create Layout Tabs
    tab1, tab2, tab3 = st.tabs(["sofa scale calculator", "show only drug extractor", "time interval"])
    
    with tab1:
        st.header("Sequential Organ Failure Assessment (SOFA) Score")
        st.markdown("""
        The SOFA score is a mortality prediction score that is based on the degree of dysfunction of 6 organ systems.
        Select the appropriate criteria for each organ system below.
        """)
        st.divider()

        # Define the options and their corresponding point values
        respiration_options = {
            "≥ 400 (0 pts)": 0,
            "< 400 (1 pt)": 1,
            "< 300 (2 pts)": 2,
            "< 200 with respiratory support (3 pts)": 3,
            "< 100 with respiratory support (4 pts)": 4
        }

        coagulation_options = {
            "≥ 150 (0 pts)": 0,
            "< 150 (1 pt)": 1,
            "< 100 (2 pts)": 2,
            "< 50 (3 pts)": 3,
            "< 20 (4 pts)": 4
        }

        liver_options = {
            "< 1.2 [< 20] (0 pts)": 0,
            "1.2–1.9 [20-32] (1 pt)": 1,
            "2.0–5.9 [33-101] (2 pts)": 2,
            "6.0–11.9 [102-204] (3 pts)": 3,
            "≥ 12.0 [> 204] (4 pts)": 4
        }

        cardiovascular_options = {
            "MAP ≥ 70 mmHg (0 pts)": 0,
            "MAP < 70 mmHg (1 pt)": 1,
            "Dopamine < 5 or dobutamine (any dose) (2 pts)": 2,
            "Dopamine 5.1–15 or epinephrine ≤ 0.1 or norepinephrine ≤ 0.1 (3 pts)": 3,
            "Dopamine > 15 or epinephrine > 0.1 or norepinephrine > 0.1 (4 pts)": 4
        }

        cns_options = {
            "15 (0 pts)": 0,
            "13–14 (1 pt)": 1,
            "10–12 (2 pts)": 2,
            "6–9 (3 pts)": 3,
            "< 6 (4 pts)": 4
        }

        renal_options = {
            "< 1.2 [< 110] (0 pts)": 0,
            "1.2–1.9 [110-170] (1 pt)": 1,
            "2.0–3.4 [171-299] (2 pts)": 2,
            "3.5–4.9 [300-440] or UOP < 500 mL/day (3 pts)": 3,
            "≥ 5.0 [> 440] or UOP < 200 mL/day (4 pts)": 4
        }

        # UI Layout using columns
        col1, col2 = st.columns(2)

        with col1:
            st.subheader("🫁 Respiration")
            st.markdown("**PaO2/FiO2 ratio, mmHg**")
            resp_selection = st.segmented_control("Respiration", list(respiration_options.keys()), default="≥ 400 (0 pts)", label_visibility="collapsed")
            resp_score = respiration_options.get(resp_selection, 0)

            st.subheader("🩸 Coagulation")
            st.markdown("**Platelets, ×10³/µL**")
            coag_selection = st.segmented_control("Coagulation", list(coagulation_options.keys()), default="≥ 150 (0 pts)", label_visibility="collapsed")
            coag_score = coagulation_options.get(coag_selection, 0)

            st.subheader("🧠 Central Nervous System")
            st.markdown("**Glasgow Coma Scale (GCS)**")
            cns_selection = st.segmented_control("CNS", list(cns_options.keys()), default="15 (0 pts)", label_visibility="collapsed")
            cns_score = cns_options.get(cns_selection, 0)

        with col2:
            st.subheader("🧪 Liver")
            st.markdown("**Bilirubin, mg/dL [μmol/L]**")
            liver_selection = st.segmented_control("Liver", list(liver_options.keys()), default="< 1.2 [< 20] (0 pts)", label_visibility="collapsed")
            liver_score = liver_options.get(liver_selection, 0)

            st.subheader("❤️ Cardiovascular")
            st.markdown("**Hypotension / Vasopressor Support** *(doses in µg/kg/min)*")
            cardio_selection = st.segmented_control("Cardiovascular", list(cardiovascular_options.keys()), default="MAP ≥ 70 mmHg (0 pts)", label_visibility="collapsed")
            cardio_score = cardiovascular_options.get(cardio_selection, 0)

            st.subheader("💧 Renal")
            st.markdown("**Creatinine, mg/dL [μmol/L] (or urine output)**")
            renal_selection = st.segmented_control("Renal", list(renal_options.keys()), default="< 1.2 [< 110] (0 pts)", label_visibility="collapsed")
            renal_score = renal_options.get(renal_selection, 0)

        st.divider()

        # Calculate Total Score
        total_score = resp_score + coag_score + liver_score + cardio_score + cns_score + renal_score

        # Layout for Total Score and Mortality
        score_col, empty_col = st.columns([1, 2])
        
        with score_col:
            st.metric(label="Total SOFA Score", value=total_score)
            
        # Simple Mortality estimate mapping
        mortality = ""
        if total_score <= 1:
            mortality = "0.0%"
        elif total_score <= 3:
            mortality = "6.4%"
        elif total_score <= 5:
            mortality = "20.2%"
        elif total_score <= 7:
            mortality = "21.5%"
        elif total_score <= 9:
            mortality = "33.3%"
        elif total_score <= 11:
            mortality = "50.0%"
        elif total_score <= 14:
            mortality = "95.2%"
        else:
            mortality = ">95.2%"

        st.info(f"**Predicted Mortality:** ~{mortality}")
        st.caption("Mortality estimates are generalizations from historical critical care cohorts and vary widely based on patient condition.")

        st.divider()

        st.subheader("📋 Output Summary")
        
        # Format the summary text
        summary_text = (
            f"Respiration = {resp_score}\n"
            f"Coagulation = {coag_score}\n"
            f"Liver = {liver_score}\n"
            f"Cardiovascular = {cardio_score}\n"
            f"Glasgow Coma Scale = {cns_score}\n"
            f"Renal = {renal_score}\n"
            f"Total = {total_score}"
        )

        st.markdown("Use the copy button in the top right of the text block below to copy your results:")
        # st.code provides an automatic "copy to clipboard" button on hover
        st.code(summary_text, language="text")

    with tab2:
        st.header("Drug Extractor & Disease Mapper")
        st.markdown("Paste a medical paragraph below to extract drug names and match them to their related diseases.")
        
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

    with tab3:
        st.header("⏳ Time Interval Duration Calculator")
        st.markdown("Calculate the exact duration (days, hours, minutes) between two dates and times. Useful for determining elapsed clinical time.")
        
        col_start, col_end = st.columns(2)
        
        with col_start:
            st.subheader("Start Time")
            start_date = st.date_input("Start Date", value=datetime.date.today() - datetime.timedelta(days=1), format="MM/DD/YYYY")
            
            st.markdown("**Start Time (Railway 24h)**")
            
            # Use Toggle Buttons for Hours and Minutes (0-23 and 0-59 with 5min steps for UI clarity)
            hour_options = [str(i).zfill(2) for i in range(24)]
            minute_options = [str(i).zfill(2) for i in range(0, 60, 5)] # 5-minute increments for cleaner UI
            
            start_hour_str = st.segmented_control("Hour", hour_options, default="08", key="sh")
            start_min_str = st.segmented_control("Minute", minute_options, default="00", key="sm")
            
            start_hour = int(start_hour_str) if start_hour_str else 0
            start_minute = int(start_min_str) if start_min_str else 0
            
            start_time = datetime.time(start_hour, start_minute)
            
        with col_end:
            st.subheader("End Time")
            end_date = st.date_input("End Date", value=datetime.date.today(), format="MM/DD/YYYY")
            
            st.markdown("**End Time (Railway 24h)**")
            
            now_hour = str(datetime.datetime.now().hour).zfill(2)
            # Find nearest 5-minute increment for current time default
            now_min_val = (datetime.datetime.now().minute // 5) * 5
            now_min = str(now_min_val).zfill(2)

            end_hour_str = st.segmented_control("Hour", hour_options, default=now_hour, key="eh")
            end_min_str = st.segmented_control("Minute", minute_options, default=now_min, key="em")
            
            end_hour = int(end_hour_str) if end_hour_str else datetime.datetime.now().hour
            end_minute = int(end_min_str) if end_min_str else now_min_val
            
            end_time = datetime.time(end_hour, end_minute)
            
        st.divider()
        
        # Combine date and time
        start_datetime = datetime.datetime.combine(start_date, start_time)
        end_datetime = datetime.datetime.combine(end_date, end_time)
        
        if end_datetime < start_datetime:
            st.error("⚠️ End time must be after the start time!")
        else:
            duration = end_datetime - start_datetime
            
            # Calculate components
            total_seconds = int(duration.total_seconds())
            days = duration.days
            hours, remainder = divmod(total_seconds - (days * 86400), 3600)
            minutes, seconds = divmod(remainder, 60)
            
            total_hours = total_seconds / 3600
            total_minutes = total_seconds / 60
            
            st.metric(label="Total Elapsed Duration", value=f"{days} days, {hours} hours, {minutes} minutes")
            
            st.markdown("### Alternatively:")
            st.write(f"- **{total_hours:,.2f}** total hours")
            st.write(f"- **{total_minutes:,.0f}** total minutes")
            st.write(f"- **{total_seconds:,}** total seconds")

if __name__ == "__main__":
    main()
