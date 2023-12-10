import streamlit as st
from streamlit_extras.switch_page_button import switch_page
import time

css ='''
<style>
    [data-testid="stSidebar"] {
        display: none;
    }
</style>
'''
st.markdown(css, unsafe_allow_html=True)



st.subheader("Kaydol")
new_username = st.text_input("Yeni Kullanıcı Adı")
new_password = st.text_input("Yeni Şifre", type="password")

def register(username, password):
    # Burada gerçek bir veritabanı veya başka bir kayıt mekanizması kullanılmalıdır.
    # Bu örnekte sadece yeni bir kullanıcıyı kabul ediyoruz.
    # Gerçek bir uygulama için daha sofistike bir kayıt işlemi yapılmalıdır.
    if username == "kullanici":
        return False
    else:
        return True


if st.button("Kaydol"):
    if not new_username or not new_password:
        st.warning("Lütfen kullanıcı adı ve şifre girin.")
    else:
        registration_successful = register(new_username, new_password)
        if registration_successful:
            st.success("Başarıyla kaydoldunuz! Şimdi giriş yapabilirsiniz.")
            time.sleep(1) 
            st.balloons() 
            time.sleep(1)
            switch_page("login")
        else:
            st.error("Kayıt başarısız. Kullanıcı adı muhtemelen zaten kullanılıyor.")

if st.button("Giriş yap"):
    switch_page("login")