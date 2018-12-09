$(document).ready(function(){

    $('[data-toggle="popover"]').popover().click(function(e){
        e.preventDefault();
    });

    $('#user_cep').blur(function(){
        $.ajax({
            url : 'http://viacep.com.br/ws/' + $('#user_cep').val() + '/json/ ',
            type : 'GET',
            dataType: 'json',
            success: function(data){
                $('#user_address').val(data.logradouro);
                $('#user_neighborhood').val(data.bairro);
                $('#user_city').val(data.localidade);
                $('#user_state').val(data.uf);
                $('#user_country').val('Brasil');

                $('#user_number').focus();
            }
        });
        return false;
    });
    $(document).on('change', '.question-type', function(){
        if(this.value === 'objective'){
            $(this).parents('fieldset').find('.question-alternatives').removeClass('hidden');
        } else if (this.value === 'open-ended'){
            $(this).parents('fieldset').find('.question-alternatives').addClass('hidden');
        }
    });

    if($("#assignment_code").length) {
        var editor = CodeMirror.fromTextArea(document.getElementById('assignment_code'), {
            lineNumbers: true,
            matchBrackets: true,
            theme: "seti",
            mode: "text/x-csrc"
        });
        var mac = CodeMirror.keyMap.default == CodeMirror.keyMap.macDefault;
        CodeMirror.keyMap.default[(mac ? "Cmd" : "Ctrl") + "-Space"] = "autocomplete";

        $(document).on('change','#assignment_code_language', function(){
            editor.setOption("mode", $("#assignment_code_language").val());

        });

        $(document).on('click', '.submit-assig', function(e){
            e.preventDefault()
            console.log("mandei hein")

            id = window.location.href.split('assignments/')[1]
            var code = editor.getValue();
            var lang = $("#assignment_code_language :selected").text()

            console.log(id, code, lang)


            $.ajax({
              type: 'POST',
              contentType: 'application/json',
              dataType: 'json',
              url: "http://localhost:5000/autoeval",
              async: true,
              cache: false,
              data:JSON.stringify( 
                {
                    'id': id,
                    'language': lang,
                    'code': code
                }),
              success: function(response){
                var grade = response['grade']
                console.log(grade)

                $.ajax({
                  type: 'POST',
                  contentType: 'application/json',
                  dataType: 'json',
                  url: "http://localhost:3000/autoevaluate",
                  async: true,
                  cache: false,
                  data:JSON.stringify( 
                    {
                        'grade': grade
                    }),
                  success: function(response){
                    alert("Submission Successful!")
                  },
                   error: function(jqXHR, textStatus, errorThrown){
                     alert(textStatus, errorThrown);
                  }
                });


                //window.location = window.location.href.split('assignments/')[0]
                //return true;
              },
               error: function(jqXHR, textStatus, errorThrown){
                 alert(textStatus, errorThrown);
              }
            });
        })

        $(document).on('click', '.run-code', function(e){
            e.preventDefault();
            console.log("oi")
            var code = editor.getValue();
            var lang = $("#assignment_code_language :selected").text()


            $.ajax({
              type: 'POST',
              contentType: 'application/json',
              dataType: 'json',
              url: "http://localhost:5000/compile",
              async: true,
              cache: false,
              data:JSON.stringify( 
                {
                    'language': lang,
                    'code': code,
                }),
              success: function(response){
                console.log(response['output'])
                alert(response['output']);
              },
               error: function(jqXHR, textStatus, errorThrown){
                 alert(textStatus, errorThrown);
              }
            });

        //     $(".loading").toggleClass('hidden');
        //     $(".run-result").toggleClass('hidden');
        //     $.ajax({
        //         type: "POST",
        //         url: "/compile",
        //         dataType: 'json',
        //         data: {
        //             code: editor.getValue(),
        //         },
        //         success: function(data)
        //         {
        //             $(".loading").toggleClass('hidden');
        //             if(data.result.compile_status == "OK"){
        //                 if(data.result.run_status.stderr !== ""){
        //                     $(".run-result code").html(data.result.run_status.stderr.replace(/[\n\r]/g, '<br>'))
        //                 }
        //                 $(".run-result code").html(data.result.run_status.output_html.replace(/[\n\r]/g, '<br>'))
        //             } else {
        //                 $(".run-result code").html(data.result.compile_status.replace(/[\n\r]/g, '<br>'))
        //             }

        //         }
        //     });
        });
    }

    if($("#assignment_evaluation").length) {
        var editor = CodeMirror.fromTextArea(document.getElementById('assignment_evaluation'), {
            lineNumbers: true,
            theme: "seti",
            mode: "text/x-csrc",
            readOnly: "nocursor"
        });
        editor.setValue($("#assignment_evaluation").val().replace(/<br>/g, '\n').trim());
        $('.CodeMirror-line').each(function(index, elem){
            var line_id = index + 1;
            $(elem).popover({
                html : true,
                placement: 'bottom',
                content: function() {
                    return $("#popover-" + line_id + "-content").html();
                }
            }).on('hide.bs.popover', function () {
                $("#code_submission_code_line_"+ line_id +"_feedback").val($("#textarea-" + line_id).val());
            }).on('shown.bs.popover', function () {
                $("#textarea-" + line_id).val($("#code_submission_code_line_"+ line_id +"_feedback").val());
            });
        });

        var request_input = []
        var request_oouts = []
        $('#inputsUpload').change(function (event) {

            request_input = []
            var files = [];
            files.push({'inputs': event.target.files});

            files = Array.from(files[0]['inputs'])

            for (var i = 0; i < files.length; i++) { //for multiple files          
                (function(file) {
                    var name = file.name;
                    var reader = new FileReader();  
                    reader.onload = function(e) {  
                        // get file content  
                        var text = e.target.result;
                        request_input.push(text)
 
                    }
                    reader.readAsText(file);
                })(files[i]);
            }



            console.log(request_input)
        });


        $('#ooutsUpload').change(function (event) {

            request_oouts = []
            var files = [];
            files.push({'oouts': event.target.files});

            files = Array.from(files[0]['oouts'])

            for (var i = 0; i < files.length; i++) { //for multiple files          
                (function(file) {
                    var name = file.name;
                    var reader = new FileReader();  
                    reader.onload = function(e) {  
                        // get file content  
                        var text = e.target.result;
                        request_oouts.push(text)
 
                    }
                    reader.readAsText(file);
                })(files[i]);
            }



            console.log(request_oouts)
        });

        $(document).on('click', '.submit', function(e){
             e.preventDefault();
            console.log("entrou")
            // e.preventDefault();
            var code = editor.getValue();
            // $(".loading").toggleClass('hidden');
            // $(".run-result").toggleClass('hidden');

            var xmlhttp;
            var lang,inputs,oouts,ext

            
            // outputs = temp0[0]['outputs']
            

            console.log(JSON.stringify(request_input))
            console.log(JSON.stringify(request_oouts))
        //console.log(reader.readAsText(form.get('fileUpload')))


            lang = String($("#lang-input :selected").text())
            inputs = request_input
            oouts = request_oouts
            if (lang == "" || inputs == ""  || oouts == "" ) {
                alert('Por favor preencha corretamente os campos.')
            }

            console.log(lang)

            if (lang == "C"){
                ext = ".c"
            }
            if (lang == "Python" || lang == "Python3"){
                ext = ".py"
            }
            


            filename = document.getElementsByClassName("page-title card")[0].innerText.toLowerCase().replace(/ /g,"_")
             + "_" 
             + window.location.href.split('evaluate/')[1]
             + ext

            console.log(lang, inputs, oouts)


            $.ajax({
              type: 'POST',
              contentType: 'application/json',
              dataType: 'json',
              url: "http://localhost:5000/evaluate",
              async: true,
              cache: false,
              data:JSON.stringify( 
                {
                    'filename': filename,
                    'language': lang,
                    'code': code,
                    'inputs': inputs,
                    'o_outs': oouts
                }),
              success: function(response){
                console.log(response['grade'])
                alert('Correcao Concluida. Nota Sugerida: ' + response['grade']);
                document.getElementById("code_submission_grade").value = response['grade']
              },
               error: function(jqXHR, textStatus, errorThrown){
                 alert(textStatus, errorThrown);
              }
            });

            // $.ajax({
            //    url: 'localhost:5000/submit',
            //    type: 'POST',
            //    dataType: 'json',
            //    data: {
            //         code: code,
            //     },
            //    success: function(response, textStatus, jqXHR) {
            //      alert("Yay!");
            //    },
            //    error: function(jqXHR, textStatus, errorThrown){
            //      alert(textStatus, errorThrown);
            //   }
            // });

            // $.ajax({
            //     type: "POST",
            //     url: "/submit",
            //     dataType: 'json',
            //     data: {
            //         code: editor.getValue(),
            //     },
            //     success: function(data)
            //     {
            //         console.log(data.result)

            //     }
            // });
        });

    }

    $(document).on("change", '#assignment-inputs', function (event) {

      request_input = []
            var files = [];
            files.push({'inputs': event.target.files});

            files = Array.from(files[0]['inputs'])

            for (var i = 0; i < files.length; i++) { //for multiple files          
                (function(file) {
                    var name = file.name;
                    var reader = new FileReader();  
                    reader.onload = function(e) {  
                        // get file content  
                        var text = e.target.result;
                        request_input.push(text)
 
                    }
                    reader.readAsText(file);
                })(files[i]);
            }



            console.log(request_input)
            return true;
        });

    $(document).on("change", "#assignment-outputs", function (event) {

            request_oouts = []
            var files = [];
            files.push({'oouts': event.target.files});

            files = Array.from(files[0]['oouts'])

            for (var i = 0; i < files.length; i++) { //for multiple files          
                (function(file) {
                    var name = file.name;
                    var reader = new FileReader();  
                    reader.onload = function(e) {  
                        // get file content  
                        var text = e.target.result;
                        request_oouts.push(text)
 
                    }
                    reader.readAsText(file);
                })(files[i]);
            }



            console.log(request_oouts)
            return true;
        });



 $(document).on('click', '.assignment-submit', function(e){
            e.preventDefault();
            console.log("entrou")
            console.log(JSON.stringify(request_input))
            console.log(JSON.stringify(request_oouts))

            id = window.location.href.split('assignments/')[1].split('/edit')[0]

            console.log(id, request_input, request_oouts)


            $.ajax({
              type: 'POST',
              contentType: 'application/json',
              dataType: 'json',
              url: "http://localhost:5000/inouts",
              async: true,
              cache: false,
              data:JSON.stringify( 
                {
                    'id': id,
                    'inputs': request_input,
                    'o_outs': request_oouts
                }),
              success: function(response){
                alert("Sucess")
                window.location = window.location.href.split('assignments/')[0]
                return true;
              },
               error: function(jqXHR, textStatus, errorThrown){
                 alert(textStatus, errorThrown);
              }
            });

    })


});