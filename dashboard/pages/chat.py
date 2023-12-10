import streamlit as st
from streamlit_extras.switch_page_button import switch_page

st.markdown(
    """
<style>
section[data-testid="stSidebar"] div.stButton button {
    height: auto;
    width: 300px;
    padding-top: 5px !important;
    padding-bottom: 5px !important;
}
[data-testid="stSidebarNav"] {
        display: none;
    }
</style>
""",
    unsafe_allow_html=True,
)

st.sidebar.title("Kullanıcılar:")

butons = []
for i in range(12):
    butons.append(st.sidebar.button(f"User - {i}"))

st.title("Echo Bot")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# React to user input
if prompt := st.chat_input("What is up?"):
    # Display user message in chat message container
    st.chat_message("user").markdown(prompt)
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})

    response = f"Echo: {prompt}"
    # Display assistant response in chat message container
    with st.chat_message("user2"):
        st.markdown(response)
    # Add assistant response to chat history
    st.session_state.messages.append({"role": "user2", "content": response})

