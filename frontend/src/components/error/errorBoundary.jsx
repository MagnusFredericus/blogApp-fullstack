import { Component, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import './errorBoundary.css'

function ErrorBoundary({children}) {
    const [hasError, setHasError] = useState(false)
    const location = useLocation()

    useEffect(() => {
        if(hasError) {
            setHasError(false)
        }
    }, [location.key])

    return (
        <ErrorBoundaryInner
            hasError={ hasError }
            setHasError={ setHasError }
        >
            {children}
        </ErrorBoundaryInner>
    )
}

class ErrorBoundaryInner extends Component{
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidUpdate(prevProps, previousState) {
        if(!this.props.hasError && prevProps.hasError) {
            this.setState({ hasError: false })
        }
    }

    componentDidCatch(error, errorInfo) {
        this.props.setHasError(true)
    }

    render() {
        if(this.state.hasError) {
            // should send a message to adms
            return (
                <div className="errorBoundary">
                <h3>Ops...</h3>
                <p>Looks like we have an error, please try again in a few moments</p>
                </div>
            )
        }
        return this.props.children
        }
}

export default ErrorBoundary;