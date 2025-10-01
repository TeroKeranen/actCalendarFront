

import { NavLink } from "react-router-dom";


const Navlinks = () => {
    

    const Links = [
        // {id: 1, url: 'createcardholder', text: 'Luo henkilö'}, // TÄLLÄ VOI LUODA YHDEN HENKIKÖN SUORAAN JÄRJESTELMÄÄN
        {id: 1, url: 'calendarcreate', text: 'Luo kalenteri'},
        {id: 2, url: 'calendars', text: 'Kalenterit'},
        {id: 3, url: 'actadmin', text: 'actadmin'},
        // {id: 5, url: 'calendarSetup', text: 'cal setup'},
      

        // {id: 5, url: '/pricing', text: 'pricing'}
    ]


    
    return (
        <>
        {Links.map((link) => {
            const {id,url,text} = link;
            if ((url === 'signing' || url === 'singup')) return null;
            
            return (
                <li key={id}>
                    <NavLink className="capitalize" to={url}>
                        {text}
                    </NavLink>
                </li>
            )
        })}
        </>

    )
}


export default Navlinks;