import React from 'react'
import { render } from 'react-dom'
import Containers from 'js/containers'

if (typeof (document) !== 'undefined' && window) {
    window.onload = () => {
        return render(
            <Containers.App />,
            document.getElementById('app')
        )
    }
}
