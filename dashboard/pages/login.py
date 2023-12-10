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



st.subheader("Giriş Yap")
username_login = st.text_input("Kullanıcı Adı")
password_login = st.text_input("Şifre", type="password")

def login(username, password):
    # Burada gerçek bir veritabanı veya başka bir doğrulama mekanizması kullanılmalıdır.
    # Bu örnekte sadece basit bir kontrol yapılıyor.
    return username == "kullanici" and password == "sifre"


if st.button("Giriş"):
    login_successful = login(username_login, password_login)
    if login_successful:
        st.success("Başarıyla giriş yaptınız!")
        # Giriş başarılı olduysa başka bir sayfaya yönlendir
        switch_page("chat")
    else :
        st.error("kulanici adi ya da sifra yanlış")

if st.button("Kaydol"):
    switch_page("register")