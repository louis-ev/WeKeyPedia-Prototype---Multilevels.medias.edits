var niveau = 0;
function hyphenate(str) {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
var toc = $('.rubrique .col3');


/******* origine : jqueryui-easing script, BSD license  ******/

$.extend($.easing,
{
    def: 'easeOutQuad',
    easeInOutQuint: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    }

});
/* universal delayer from stackoverflow */
var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();

function getSelectedText() {
    var text = "";
    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;
}

function doSomethingWithSelectedText() {
    var selectedText = getSelectedText();
    if (selectedText) {
        console.log("Got selected text " + selectedText);
    }
}

function modeApercu () {

	$("body").addClass("apercu");
	$(".colonne").each( function() {
		if ( $(this).data('col') !== "" ) {
			$that = $(this);
			$colonnes = $that.find(".col3");

			console.log( "$that.data('col')" + $that.data('col') );

			var rubriqueamontrer = $colonnes.filter( function() {
				console.log( "$(this).data('gotoniveau')" + $(this).data('gotoniveau') );
				return $(this).data('gotoniveau').match( $that.data('col') )
			});

			$colonnes.addClass("collapsed");
			rubriqueamontrer.removeClass("collapsed");
		}
	});
}

function modeColonne ( numColonneAMontrer ) {

	$("body").removeClass("apercu");
	$(".col3").removeClass("collapsed");
	setTimeout(	function() {
		movecol( numColonneAMontrer );
	}, 1400 );

}

// gogo colonne cliquées
var movecol = function (gotoniveau) {

	var newColonne = $('.colonne[data-col=' + gotoniveau + ']');

	// l'objectif est de centrer sur la colonne
	// il faut donc trouver le scrollLeft qui prendra en compte la largeur de la fenêtre et la position du centre, soit
	var posCenterCol = newColonne.position().left + ($('.colonne[data-col=' + gotoniveau + ']').width() / 2);

	var scrollLeftValue = $('#masque').scrollLeft() + posCenterCol - $(window).width() / 2;

	// scrollLeftValue pour scrollLeft. Mais translateX du container dans le masque est plus fluide
	//console.log( "scrollLeftValue : " + scrollLeftValue);
	//var scrollLeftValue = $('#masque').scrollLeft() + $('.colonne[data-col=' + gotoniveau + ']').offset().left - 0.05*$(window).width();

	// position de la colonne concernée dans l'espace
	var moveColValue = posCenterCol - $(window).width() / 2;

	// déplacement du container avec un translateX
	$('#masque .container, #toolbar-fond').transition({
		x: -scrollLeftValue,
		duration : 800,
		easing: "snap",
	});

	$(".colonne").addClass("peripherie");
	$('.colonne[data-col=' + gotoniveau + ']').removeClass("peripherie");
	$('body').removeClass("niveau0 niveau1 niveau2");
	$('body').addClass(gotoniveau);

};

var checkniveau = function (level) {
	level = level < 0 ? 0 : level;
	level = level > 2 ? 2 : level;
	return level;
}



// reconstruction des commentaires
function reconstructCommentaires ( commentData ) {

	console.log("commentData.length : " + commentData.length);

	for (var i = 0; i < commentData.length; i++) {

		var comments = commentData[i];
		console.log( "comments", comments);

		var id = comments.id;
		var auteur = comments.nom.toString();
		var texte = comments.texte.toString();
		var difficulte = comments.position[0].diff;
		var paragraphe = comments.position[0].para;

		var commentField = $('.colonne[data-col=' + difficulte + ']').find( '.bloctext[data-para="' + paragraphe + '"] .comments' );

		var constructionCommentaire = '<div class="commentaire" data-id="' + id + '" data-auteur="' + auteur + '"><div class="commentContainer"><div class="auteur">' + auteur + '</div><div class="texte">' + texte + '</div></div></div>';

		console.log( "%c constructionCommentaire : " + constructionCommentaire, 'background: #eee; color: #09606F');

		console.log( "commentField : ", commentField);

		// regarder si il existe déjà
		if ( commentField.find(".commentaire[data-id=" + comments.id + "]").length === 0 ) {
			commentField.find(".submit").before( constructionCommentaire );
		}

	}

	//console.log("dataArray");
	//console.log(dataArray);


}

// add comment
function newComment( commentData, $this ) {

	var newId = commentData.length;
	var difficulte = $this.parents(".colonne").data("col");
	var paragraphe = $this.parents(".bloctext").data("para");
	var nom = $this.siblings().closest(".nom").val();
	var texte = $this.siblings().closest(".texte").val();

	commentData[commentData.length] = { "id" : newId, "nom": nom, "texte": texte,	"position": [{ "diff": difficulte, "para": paragraphe }]
 };
 	updateJSON ( commentData, originJson);

}

function popupPrompt (instructions, prevValue) {
    var x;
    var name = prompt( instructions,"");
    if ( name != "" && name != null) {
		return name;
	}
	return prevValue;
}

function updateJSON ( commentData, originJson) {

	console.log("updateJSON");
	console.log( originJson );
	console.log( commentData );
	//var JSONdataToWrite = JSON.stringify(data);

	setTimeout(function () {

		$.ajax({
		    url: 'update.php',
		    type: "POST",
		    data: { path: originJson, data: commentData },
		    timeout: 2000,
		    success:  function(output) {
		        console.log(output);
				reconstructCommentaires(commentData);
		    },
		    error: function(output) {
				console.log("error : " + output);
				console.log(output);
		    }
		});
	}, 200);

}






$(document).ready( function() {

	$('#toolbar').css("opacity", 1);
	$('.container').css("opacity", 1);

	modeApercu ();

	// si clique sur titre (id de l'élément à scroller)
	var movetitre = function (selector) {
		// scroll du haut
		$('#masque').animate({
			scrollTop: $('#masque').scrollTop() + selector.offset().top - 25
		}, { duration: 800, queue: false });
	};

	// bordure de navigation dans la colonne
	{
		$(".colonne").each( function () {
			var counter = 0;
			$(this).find('p, h4').each( function () {
				counter += 1;
				$(this).wrap('<div class="bloctext" data-para="' + counter + '"></div>');
			});
		});

		// bordure gauche-droite
//		$('<div class="border border-left"></div><div class="border border-right"></div>').insertAfter('.colonne p, .colonne h4');
		// icone a cote du titre
// 		$('<div class="gene"><img src="img/genealogy.svg" alt="glyphicons_008_film" width="" height="" /></div>').insertBefore('.inside h1');
		// icone dans toolbar
		$('#titrearticle').append('<div class="gene"><img src="images/genealogy.svg" alt="glyphicons_008_film" width="" height="" /></div>');
		// ajouter les champs de commentaire
		$('<div class="comments"><div class="submit"><h5>Comments</h5><textarea class="nom"></textarea><textarea class="texte"></textarea><button class="send"></button></div></div>').insertAfter('.colonne p, .colonne h4');
	}


	// titre "difficulté en haut de la colonne
	{
		$(".colonne").each( function () {
			$this = $(this);
			var niveauN = $this.data("col");
			var difficulte = $this.find(".col3[data-gotoniveau=" + niveauN + "]").find("h5.titrecol").text();
			$this.find(".inside").before("<h5 class='titreTopCol " + niveauN + "'>" + difficulte + "</h5>");
		});



	}

	// création de rubriques
	{
		var counter = 0;
		$('.colonne.simple h2').each(function() {
			var refcounter = 'simple'+counter++;
			$(this).attr('id', refcounter);
			$('.rubrique .simple ol').append('<li><h5 data-goto="'+refcounter+'">'+$(this).text()+'</h5></li>');
		});
		counter = 0;
		$('.colonne.moyen h2').each(function() {
			var refcounter = 'moyen'+counter++;
			$(this).attr('id', refcounter);
			$('.rubrique .moyen ol').append('<li><h5 data-goto="'+refcounter+'">'+$(this).text()+'</h5></li>');
		});
		counter = 0;
		$('.colonne.complex h2').each(function() {
			var refcounter = 'complex'+counter++;
			$(this).attr('id', refcounter);
			$('.rubrique .complex ol').append('<li><h5 data-goto="'+refcounter+'">'+$(this).text()+'</h5></li>');
		});
	}


	// état "far" du block du haut
	{
		var pscrollduhaut = 0;

		$('#masque').bind("scroll", function () {

			var scrollduhaut = $('#masque').scrollTop();

			// état far ou pas de la bar du haut
			if ( scrollduhaut < 75 ) {

				$('.toolbarcontainer').removeClass("far away");


			} else {

				// calculer la direction du scroll et la vitesse
				console.log("delta : " + (pscrollduhaut - scrollduhaut) );

				var deltascroll = (pscrollduhaut - scrollduhaut);

				if (deltascroll < 0) {
					$('.toolbarcontainer').addClass("away");
				}

				if (deltascroll > 10) {
					$('.toolbarcontainer').removeClass("away");
				}

				pscrollduhaut = scrollduhaut;

				$('.toolbarcontainer').addClass("far");

			}

			//articleProche(scollduhaut);
			//$('.toolbar-fond')
		});
	}

	// load Comments
	window.originJson = "comments.json";

	$.getJSON( originJson, function(data) {

		console.log( "data : " + data );
		console.table( data );

		window.commentData = data;

		reconstructCommentaires ( commentData );

	});






	$(window).resize(function(){
	    waitForFinalEvent(function(){
			setTimeout(	function() {
				movecol( niveau );
			}, 1400 );
	    }, 500, "resize");

	});




	/************************************************ click events ************************************************/

	// selected text
	document.onmouseup = doSomethingWithSelectedText;
	document.onkeyup = doSomethingWithSelectedText;

	$('body').click( function(e) {

		// click sur Wekeypedia (en attendant)
		var $figure = $(e.target);
		var quelNiveauN = $figure.closest(".colonne").data("col");
		console.log($figure);

		// si en mode apercu, un click sur une colonne passe en mode
		if ( $("body").hasClass("apercu") ) {
			var getCol = $figure.closest(".colonne").data("col");
			console.log("getCol : " + getCol);
			if ( getCol !== null ) {
				modeColonne ( getCol );
			}
		} else

		// click sur Wekeypedia : retour à l'apercu
		if ( $figure.is('#bloclogo h2') ) {
			console.log("plop");
			modeApercu ();
		} else

		// click sur une autre colonne, non consultée
		if ( quelNiveauN !== $("body").attr("class") && quelNiveauN !== undefined ) {
			console.log("colonne inside");
			movecol( quelNiveauN );
		} else

		// click d'une colonne de rubrique : changement de col
		if ( $figure.is(".col3>h5") ) {
			console.log(".col3>h5");
			movecol( $figure.closest(".col3").data("gotoniveau") );
		} else

		// click sur élément d'une rubrique
		if ( $figure.is($('.rubrique ol h5')) ) {
			console.log(".rubrique ol h5");
			if ( !$("body").hasClass("apercu") ) {
				movecol( $figure.closest(".col3").data("gotoniveau") );
			}
			movetitre( $(".colonne h2[id=" + $figure.data("goto") + "]") );
		} else

		// au click sur les bordures
		if ( $figure.is($(".border-right")) ) {
			niveau += 1;
			movecol( "niveau" + checkniveau(niveau) );
			// placeholder
			movetitre( $("h2[data-topic=" + "development" + checkniveau(niveau) + "]") );
		} else

		if ( $figure.is($(".border-left")) ) {
			niveau -= 1;
			movecol( "niveau" + checkniveau(niveau) );
			// placeholder
			movetitre( $("h2[data-topic=" + "development" + checkniveau(niveau) + "]") );
		} else

		if ( $figure.is($(".send")) ) {
			console.log("plop");
			newComment( commentData, $figure );
		}

	});







});