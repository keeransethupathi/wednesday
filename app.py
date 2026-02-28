import streamlit as st

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

    st.title("⚕️ Sequential Organ Failure Assessment (SOFA) Score")
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

if __name__ == "__main__":
    main()
