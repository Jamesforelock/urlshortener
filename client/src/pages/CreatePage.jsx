import React, {useState, useContext} from 'react'
import { useHttp } from '../hooks/http.hook'
import { useEffect } from 'react'
import {useHistory} from 'react-router-dom'
import { AuthContext } from '../context/authContext'

export const CreatePage = () => {
    const history = useHistory()
    const auth = useContext(AuthContext)
    const {request} = useHttp()
    const [link, setLink] = useState('')

    useEffect(() => {
        window.M.updateTextFields()
    }, [])

    const pressHandler = async event => {
        if(event.key === 'Enter') {
            try {
                const data = await request('api/link/generate', 'POST', {from: link} , {
                    Authorization: `Bearer ${auth.token}`
                })
               history.push(`/detail/${data.link._id}`)
            } catch (e) {}
        }
    }
    return (
        <div className="row">
            <div className="col s8 offset-s2" style={{ paddingTop: "2rem" }}>
                <div class="input-field">
                    <input placeholder="Your link" id="link" type="text"
                        onChange={e => setLink(e.target.value)} value={link}
                        onKeyPress={pressHandler}
                        />
                    <label for="link">Input link</label>
                </div>
            </div>
        </div>
    )
}