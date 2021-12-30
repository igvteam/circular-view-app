import {CircularView} from "../../../circular-view/dist/circular-view.js"

const el = document.getElementById('jbrowse_circular_genome_view')
const config = {

    width: 670,
    height: 660,
    showCloseButton: false,

    assembly: {
        id: "hg38",
        name: "hg38",
        chromosomes: [
            {"name": "1", "bpLength": 248956422},
            {"name": "2", "bpLength": 242193529},
            {"name": "3", "bpLength": 198295559},
            {"name": "4", "bpLength": 190214555},
            {"name": "5", "bpLength": 181538259},
            {"name": "6", "bpLength": 170805979},
            {"name": "7", "bpLength": 159345973},
            {"name": "8", "bpLength": 145138636},
            {"name": "9", "bpLength": 138394717},
            {"name": "10", "bpLength": 133797422},
            {"name": "11", "bpLength": 135086622},
            {"name": "12", "bpLength": 133275309},
            {"name": "13", "bpLength": 114364328},
            {"name": "14", "bpLength": 107043718},
            {"name": "15", "bpLength": 101991189},
            {"name": "16", "bpLength": 90338345},
            {"name": "17", "bpLength": 83257441},
            {"name": "18", "bpLength": 80373285},
            {"name": "19", "bpLength": 58617616},
            {"name": "20", "bpLength": 64444167},
            {"name": "21", "bpLength": 46709983},
            {"name": "22", "bpLength": 50818468},
            {"name": "X", "bpLength": 156040895},
            {"name": "Y", "bpLength": 57227415}]
    },


    onChordClick: (feature) => {

        const f1 = feature.data
        const f2 = f1.mate
        const flanking = 1000

        const s1 = Math.max(0, f1.start - flanking)
        const e1 = f1.end + flanking
        const s2 = Math.max(0, f2.start - flanking)
        const e2 = f2.end + flanking

        const searchString = `addframes ${f1.refName}:${s1}-${e1} ${f2.refName}:${s2}-${e2}\r\n`

        window.api.send("toIGV", searchString)
    }
}

const circularView = new CircularView(el, config)

window.addEventListener('resize', () => {
    circularView.setSize(window.innerWidth - 20, window.innerHeight - 70)
})

window.api.receive("fromMain", (data) => {
    try {

        const message = JSON.parse(data)

        switch (message.message) {
            case 'addChords':
                const chords = message.data.chords
                const options = message.data
                circularView.addChords(chords, options)
                break

            case 'clearChords':
                circularView.clearChords()
                break

            case 'setAssembly':
                const assembly = message.data
                circularView.setAssembly(assembly)
                break

            case 'ready':
                circularView.setSize(window.innerWidth - 20, window.innerHeight - 70)
                break

            case 'alert':
                console.log(message)
                alert(message.data)

            default:
                console.log(`Unknown message ${message.message}`)
        }

    } catch (e) {
        console.error(e)
    }

})
