import streamlit as st
import datetime
import calendar

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
    
    # Check for API key in secrets, otherwise ask in sidebar
    try:
        api_key = st.secrets["GEMINI_API_KEY"]
    except Exception:
        api_key = ""
        
    with st.sidebar:
        st.header("⚙️ Settings")
        if not api_key:
            api_key = st.text_input("Gemini API Key", type="password", help="Enter your Google Gemini API Key to enable AI features (e.g., drug extraction).")
            if not api_key:
                st.warning("Please enter your Gemini API Key to use AI features.")
        else:
            st.success("API Key loaded from secrets.")
            
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
        except ImportError:
            st.sidebar.error("Please install google-generativeai to use AI features.")
    
    # Create Layout Tabs
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["sofa scale calculator", "KDIGO AKI calculation", "show only drug extractor", "time interval", "long term drug ICD"])
    
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
        st.header("Kidney Disease: Improving Global Outcomes (KDIGO) AKI")
        st.markdown("""
        The KDIGO 2012 guidelines define Acute Kidney Injury (AKI) based on serum creatinine changes and urine output.
        """)
        st.divider()

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("🧪 Creatinine Criteria")
            curr_creat = st.number_input("Current Serum Creatinine (mg/dL)", min_value=0.0, step=0.1, value=1.0, help="Most recent creatinine level")
            base_creat = st.number_input("Baseline Serum Creatinine (mg/dL)", min_value=0.0, step=0.1, value=1.0, help="Known baseline. If unknown, use the lowest creatinine level attained during admission.")
            prev_creat_48h = st.number_input("Previous Creatinine (within 48 hrs) (mg/dL)", min_value=0.0, step=0.1, value=1.0, help="For prospective measurement comparison")

        with col2:
            st.subheader("💧 Urine Output Criteria")
            u_vol = st.number_input("Urine Volume (mL)", min_value=0.0, step=10.0, value=500.0)
            weight = st.number_input("Patient Weight (kg)", min_value=1.0, step=1.0, value=70.0)
            duration_hrs = st.number_input("Collection Duration (hours)", min_value=1.0, step=1.0, value=12.0)

        st.divider()

        # Calculations
        crit1_met = False
        crit1_val = 0.0
        if base_creat > 0:
            crit1_val = curr_creat / base_creat
            if crit1_val >= 1.5:
                crit1_met = True

        crit2_met = False
        crit2_diff = curr_creat - prev_creat_48h
        if crit2_diff >= 0.3:
            crit2_met = True

        uop_rate = u_vol / weight / duration_hrs
        crit3_met = False
        if uop_rate < 0.5:
            crit3_met = True

        # Results Display
        st.subheader("📊 Results")
        
        c1, c2, c3 = st.columns(3)
        
        with c1:
            st.markdown("**Criterion 1**")
            st.markdown(f"$\ge 1.5 \\times$ baseline")
            if crit1_met:
                st.success(f"MET (Ratio: {crit1_val:.2f})")
            else:
                st.info(f"Not Met (Ratio: {crit1_val:.2f})")

        with c2:
            st.markdown("**Criterion 2**")
            st.markdown(f"$\ge 0.3$ mg/dL increase (48h)")
            if crit2_met:
                st.success(f"MET (Increase: {crit2_diff:.2f})")
            else:
                st.info(f"Not Met (Increase: {crit2_diff:.2f})")

        with c3:
            st.markdown("**Criterion 3**")
            st.markdown(f"UOP < 0.5 ml/kg/hr")
            if crit3_met:
                st.success(f"MET (Rate: {uop_rate:.3f})")
            else:
                st.info(f"Not Met (Rate: {uop_rate:.3f})")

        st.divider()
        
        is_aki = crit1_met or crit2_met or crit3_met
        if is_aki:
            st.error("### AKI Criteria MET")
            st.markdown("The patient meets the KDIGO criteria for Acute Kidney Injury.")
        else:
            st.success("### No AKI Criteria Met")
            st.markdown("The values provided do not meet the KDIGO criteria for Acute Kidney Injury.")

        st.subheader("📋 Output Summary")
        summary_kdigo = (
            f"Current Creatinine: {curr_creat} mg/dL\n"
            f"Baseline Creatinine: {base_creat} mg/dL (Ratio: {crit1_val:.2f})\n"
            f"Previous Creatinine (48h): {prev_creat_48h} mg/dL (Diff: {crit2_diff:.2f})\n"
            f"Urine Output: {u_vol} mL over {duration_hrs}h (Rate: {uop_rate:.3f} ml/kg/hr)\n"
            f"KDIGO AKI Status: {'MET' if is_aki else 'NOT MET'}"
        )
        st.code(summary_kdigo, language="text")

    with tab3:
        st.header("Drug Extractor & Disease Mapper (AI-Powered)")
        st.markdown("Paste a medical paragraph below to extract drug names and match them to their related diseases using Google Gemini AI.")
        
        user_text = st.text_area("Input Medical Text Here:", height=200, placeholder="e.g. The patient presented with hypertension and was started on lisinopril and amlodipine. Given their history of afib, apixaban was continued...")
        
        if st.button("Extract Drugs with AI", type="primary"):
            if not user_text.strip():
                st.warning("Please enter some text to extract drugs from.")
            elif not api_key:
                st.error("Please provide a Gemini API Key in the sidebar to use the AI Extractor.")
            else:
                with st.spinner("Analyzing medical text..."):
                    try:
                        import google.generativeai as genai
                        import json
                        
                        # Use Gemini to extract drugs and map to indications
                        generation_config = {
                            "temperature": 0.1,
                            "top_p": 0.95,
                            "top_k": 64,
                            "max_output_tokens": 1024,
                            "response_mime_type": "application/json",
                        }
                        
                        model = genai.GenerativeModel(
                            model_name="gemini-2.5-flash",
                            generation_config=generation_config
                        )
                        
                        prompt = f"""
                        You are a clinical AI assistant. Your task is to extract all medication/drug names from the clinical text provided below.
                        For each drug identified, provide the most likely 'Related Disease / Indication' for which it is being used, based on the context or standard medical knowledge.
                        
                        Return the result as a JSON array of objects. 
                        Each object must have exactly two keys: "Detected Drug" and "Related Disease / Indication".
                        If no drugs are found, return an empty array [].
                        Do not include any other text besides the JSON array.
                        
                        Clinical Text:
                        "{user_text}"
                        """
                        
                        # Corrected model version if necessary (user had "gemini-2.5-flash" in original, 
                        # but genai usually uses "gemini-1.5-flash" or similar. 
                        # I'll stick to what was in the file or update to a standard one if I'm sure)
                        # Actually the file had "gemini-2.5-flash" (maybe a typo or future/custom version in their env?)
                        # I'll keep it as is to avoid breaking their current setup if it works.
                        
                        response = model.generate_content(prompt)
                        
                        try:
                            extracted_results = json.loads(response.text)
                            if extracted_results:
                                st.success(f"AI found {len(extracted_results)} drug(s) in the text!")
                                st.dataframe(extracted_results, use_container_width=True, hide_index=True)
                            else:
                                st.info("The AI did not detect any medications in the provided text.")
                        except json.JSONDecodeError:
                            st.error("Failed to parse AI response. Please try again.")
                            st.code(response.text)
                            
                    except Exception as e:
                        st.error(f"An error occurred during AI extraction: {str(e)}")

    with tab4:
        st.header("⏳ Time Interval Duration Calculator")
        st.markdown("Calculate the exact duration (days, hours, minutes) between two dates and times. Useful for determining elapsed clinical time.")
        
        # Options for Date and Time Toggles
        month_options = [calendar.month_abbr[i] for i in range(1, 13)]
        hour_options = [str(i).zfill(2) for i in range(24)]
        minute_options = [str(i).zfill(2) for i in range(0, 60, 5)] # 5-minute increments
        
        col_start, col_end = st.columns(2)
        
        with col_start:
            st.subheader("Start Time")
            
            yesterday = datetime.date.today() - datetime.timedelta(days=1)
            
            st.markdown("**Start Date**")
            s_year_col, _ = st.columns([1, 2])
            with s_year_col:
                start_year = st.number_input("Year", min_value=2000, max_value=2100, value=yesterday.year, key="sy")
                
            start_month_str = st.segmented_control("Month", month_options, default=calendar.month_abbr[yesterday.month], key="smo")
            
            # Dynamically calculate the number of days based on the selected year and month
            start_month_num = list(calendar.month_abbr).index(start_month_str) if start_month_str else yesterday.month
            start_max_days = calendar.monthrange(start_year, start_month_num)[1]
            start_day_options = [str(i).zfill(2) for i in range(1, start_max_days + 1)]
            
            # Snap to maximum valid day if previous selection exceeds new month's limit
            current_start_day = min(yesterday.day, start_max_days)
            start_day_str = st.segmented_control("Day", start_day_options, default=str(current_start_day).zfill(2), key="sda")
            
            st.markdown("**Start Time (24h)**")
            
            start_hour_str = st.segmented_control("Hour", hour_options, default="08", key="sh")
            start_min_str = st.segmented_control("Minute", minute_options, default="00", key="sm")
            
            try:
                start_month = list(calendar.month_abbr).index(start_month_str) if start_month_str else yesterday.month
                start_day = int(start_day_str) if start_day_str else yesterday.day
                start_date = datetime.date(start_year, start_month, start_day)
            except ValueError:
                st.error("⚠️ Invalid Start Date (e.g. Feb 30). Defaulting to 1st of month.")
                start_date = datetime.date(start_year, start_month, 1)
 
            start_hour = int(start_hour_str) if start_hour_str else 0
            start_minute = int(start_min_str) if start_min_str else 0
            start_time = datetime.time(start_hour, start_minute)
            
        with col_end:
            st.subheader("End Time")
            
            today = datetime.date.today()
            
            st.markdown("**End Date**")
            e_year_col, _ = st.columns([1, 2])
            with e_year_col:
                end_year = st.number_input("Year", min_value=2000, max_value=2100, value=today.year, key="ey")
                
            end_month_str = st.segmented_control("Month", month_options, default=calendar.month_abbr[today.month], key="emo")
            
            # Dynamically calculate the number of days based on the selected year and month
            end_month_num = list(calendar.month_abbr).index(end_month_str) if end_month_str else today.month
            end_max_days = calendar.monthrange(end_year, end_month_num)[1]
            end_day_options = [str(i).zfill(2) for i in range(1, end_max_days + 1)]
            
            # Snap to maximum valid day if previous selection exceeds new month's limit
            current_end_day = min(today.day, end_max_days)
            end_day_str = st.segmented_control("Day", end_day_options, default=str(current_end_day).zfill(2), key="eda")
            
            st.markdown("**End Time (24h)**")
            
            now_hour = str(datetime.datetime.now().hour).zfill(2)
            now_min_val = (datetime.datetime.now().minute // 5) * 5
            now_min = str(now_min_val).zfill(2)
 
            end_hour_str = st.segmented_control("Hour", hour_options, default=now_hour, key="eh")
            end_min_str = st.segmented_control("Minute", minute_options, default=now_min, key="em")
            
            try:
                end_month = list(calendar.month_abbr).index(end_month_str) if end_month_str else today.month
                end_day = int(end_day_str) if end_day_str else today.day
                end_date = datetime.date(end_year, end_month, end_day)
            except ValueError:
                st.error("⚠️ Invalid End Date (e.g. Feb 30). Defaulting to 1st of month.")
                end_date = datetime.date(end_year, end_month, 1)
            
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
 
    with tab5:
        st.header("💊 Long-term Drug Use ICD-10 Mapper")
        st.markdown("Enter a drug name to find its most likely Z79 ICD-10 code for long-term (current) use using Google Gemini AI.")
        
        drug_input = st.text_input("Enter drug name:", placeholder="e.g. insulin, metformin, aspirin, warfarin").strip().lower()
        
        if st.button("Find ICD-10 Code with AI", type="primary"):
            if not drug_input:
                st.warning("Please enter a drug name to search for.")
            elif not api_key:
                st.error("Please provide a Gemini API Key in the sidebar to use the AI tool.")
            else:
                with st.spinner(f"Finding ICD-10 code for '{drug_input}'..."):
                    try:
                        import google.generativeai as genai
                        
                        generation_config = {
                            "temperature": 0.1,
                            "top_p": 0.95,
                            "top_k": 64,
                            "max_output_tokens": 256,
                            "response_mime_type": "text/plain",
                        }
                        
                        model = genai.GenerativeModel(
                            model_name="gemini-2.5-flash",
                            generation_config=generation_config
                        )
                        
                        prompt = f"""
                        You are a clinical AI coding assistant. Your task is to provide the most accurate ICD-10 code for long-term (current) use (usually starting with Z79) for the following drug(s).
                        
                        Drug Input: "{drug_input}"
                        
                        The user may provide one or multiple drugs (e.g. separated by commas). For each distinct drug found:
                        1. If the drug name appears to be misspelled, please correct it. 
                        2. Provide the ICD-10 code and description.
                        
                        Important Rules:
                        - If the drug is levothyroxine or any other thyroid hormone replacement, the code MUST be Z79.890 (Hormone replacement therapy).
                        
                        If no specific long-term ICD code is applicable for a drug, state that it might fall under 'Z79.899 - Other long term (current) drug therapy' or specify that there isn't one.
                        
                        Return the results as a bulleted list. Each bullet must be formatted exactly like this:
                        * **[Corrected Drug Name]**: Code - Description
                        
                        Do not provide extra conversation or introductory text. Just the bullet points.
                        """
                        
                        response = model.generate_content(prompt)
                        st.success(response.text.strip())
                            
                    except Exception as e:
                        st.error(f"An error occurred during AI search: {str(e)}")

if __name__ == "__main__":
    main()
