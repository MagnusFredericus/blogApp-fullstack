import './menuButton.css'

function MenuButton({menuOpen, handleClick}) {
    return (
        <div
            className={
                menuOpen 
                ? `menuButton menuButton--open` 
                : `menuButton`
            } 
            onClick={ handleClick }>
                <div className="menuButtonBurguer"></div>
        </div>
    )
}

export default MenuButton;