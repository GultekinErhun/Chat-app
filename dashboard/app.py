import streamlit as st
from streamlit_extras.switch_page_button import switch_page

css ='''
<style>
    [data-testid="stSidebar"] {
        display: none;
    }
</style>
'''
st.markdown(css, unsafe_allow_html=True)


switch_page("login")