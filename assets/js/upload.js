function handle_file_select( evt ) {
    console.info ( "[Event] file chooser" );

    let fl_files = evt.target.files; // JS FileList object

    // use the 1st file from the list
    let fl_file = fl_files[0];

    let reader = new FileReader(); // built in API

    let display_file = ( e ) => { // set the contents of the <textarea>
        //console.info( '. . got: ', e.target.result.length, e );
        //console.log(e.target.result)
        jQuery( '#importexport' ).val(e.target.result);
        };

    let on_reader_load = ( fl ) => {
        //console.info( '. file reader load', fl );
        return display_file; // a function
        };

    // Closure to capture the file information.
    reader.onload = on_reader_load( fl_file );

    // Read the file as text.
    reader.readAsText( fl_file );
    }

// add a function to call when the <input type=file> status changes, but don't "submit" the form
document.getElementById( 'upload' ).addEventListener( 'change', handle_file_select, false );
