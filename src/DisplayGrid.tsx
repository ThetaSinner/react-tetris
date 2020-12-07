import './DisplayGrid.css'

export default function DisplayGrid({gridModel}: { gridModel: string[][] }) {
    const display = gridModel.map((row, index) => {
        return <div className="GridRow" key={index}>
            {row.map((item, index) => <div className={['GridItem', 'GridItemColor-' + item].join(' ')} key={index}/>)}
        </div>
    })

    return (
        <div className="GridParent">
            <div className="GridContainer">
                {display}
            </div>
        </div>
    )
}
