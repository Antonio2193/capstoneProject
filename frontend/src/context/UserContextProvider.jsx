import { useState, createContext, useEffect } from "react";
import { me, loadUserLibrary, updatePrivacy, deleteFromLibrary} from "../data/fetch";

export const UserContext = createContext();

export default function UserContextProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userInfo, setUserInfo] = useState();
  const [myLibrary, setMyLibrary] = useState({ anime: [], manga: [] }); // Inizializza myLibrary con anime e manga

  const getME = async () => {
    try {
      const meInfo = await me();
      setUserInfo(meInfo);
    } catch (error) {
      if (error.message === "401") {
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  };

  const getMyLibrary = async () => {
    if (token && userInfo) {
        try {
            const libraryData = await loadUserLibrary(userInfo._id);
            setMyLibrary(libraryData);
            console.log("MyLibrary aggiornata con:", libraryData);
        } catch (error) {
            console.error("Errore nel caricamento della libreria dell'utente:", error);
        }
    }
};

  //funzione per aggiornare myLibrary con un anime aggiunto
  const addAnimeToMyLibrary = (addedAnime) => {
    setMyLibrary(prevLibrary => ({
      ...prevLibrary,
      anime: [...prevLibrary.anime, addedAnime]
    }));
  };

  //funzione per aggiornare myLibrary con un manga aggiunto
  const addMangaToMyLibrary = (addedManga) => {
    setMyLibrary(prevLibrary => ({
      ...prevLibrary,
      manga: [...prevLibrary.manga, addedManga]
    }));
  };

  // Aggiorna la privacy di un elemento nella libreria
  const togglePrivacy = async (itemId, type, isPrivate) => {
    console.log("Valori passati a togglePrivacy:", { itemId, type, isPrivate });
    try {
        // Assicurati di passare solo isPrivate come oggetto
        const updatedItem = await updatePrivacy(userInfo._id, itemId, { isPrivate }); 
        setMyLibrary(prevLibrary => ({
            ...prevLibrary,
            [type]: prevLibrary[type].map(item => 
                item.originalID === itemId ? { ...item, isPrivate: updatedItem.isPrivate } : item
            )
        }));
    } catch (error) {
        console.error("Errore nell'aggiornamento della privacy:", error);
    }
};

const removeFromLibrary = async (itemId, type) => {
  try {
      await deleteFromLibrary(userInfo._id, itemId);
      setMyLibrary(prevLibrary => ({
          ...prevLibrary,
          [type]: prevLibrary[type].filter(item => item.originalID !== itemId) // Filtra l'elemento rimosso
      }));
  } catch (error) {
      console.error("Errore nella rimozione dell'elemento:", error);
  }
};

  // Funzione per ottenere i dati dell'utente
  useEffect(() => {
    if (token) getME();
  }, [token]);
  
  // Funzione per caricare la MyLibrary quando userInfo è disponibile
  useEffect(() => {
    if (userInfo) getMyLibrary(); // Assicurati che userInfo sia disponibile prima di chiamare getMyLibrary
  }, [userInfo]);

  const value = { 
    token, 
    setToken, 
    userInfo, 
    setUserInfo, 
    myLibrary, 
    setMyLibrary,
    addAnimeToMyLibrary,
    addMangaToMyLibrary,
    getMyLibrary,
    togglePrivacy,
    removeFromLibrary
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
