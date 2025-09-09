

import { NavLink } from "react-router-dom";


const Navlinks = () => {
    

    const Links = [
        {id: 1, url: 'welcome', text: 'welcome'},
        {id: 2, url: 'createcardholder', text: 'Luo henkilö'},
        {id: 3, url: 'calendarcreate', text: 'Luo kalenteri'},
        {id: 4, url: 'calendars', text: 'Kalenterit'},
        // {id: 2, url: 'calendarSetup', text: 'cal setup'},
      

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