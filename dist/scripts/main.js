(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	$('.container').css("width", "100vw");
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
	$('.container').css("width", "290vw");
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
	$('#masque .container').transition({
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

		var constructionCommentaire = '<div class="commentaire" data-id="' + id + '" data-auteur="' + auteur + '"><div class="auteur">' + auteur + '</div><div class="texte">' + texte + '</div></div>';

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
			scrollTop: $('#masque').scrollTop() + selector.offset().top - 80
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
		$('<div class="border border-left"></div><div class="border border-right"></div>').insertAfter('.colonne p, .colonne h4');
		// icone a cote du titre
/* 		$('<div class="gene"><img src="img/genealogy.svg" alt="glyphicons_008_film" width="" height="" /></div>').insertBefore('.inside h1'); */
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
			$this.find(".inside").before("<h5 class='titreTopCol + " + niveauN + "'>" + difficulte + "</h5>");
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
		$('#masque').bind("scroll", function () {
			var scrollduhaut = $('#masque').scrollTop();
			if ( scrollduhaut < 80 ) {
				$('#toolbar').removeClass("far");
			} else {
				$('#toolbar').addClass("far");
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
		console.log($figure);

		if ( $("body").hasClass("apercu") ) {
			var getCol = $figure.closest(".colonne").data("col");
			console.log("getCol : " + getCol);
			modeColonne ( getCol );
		} else

		if ( $figure.is('#bloclogo h2') ) {
			console.log("plop");
			modeColonne ( "niveau0" );
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
			movetitre( $("h2[data-topic=" + "development" + checkniveau(niveau) + "]") );
		} else

		if ( $figure.is($(".border-left")) ) {
			niveau -= 1;
			movecol( "niveau" + checkniveau(niveau) );
			movetitre( $("h2[data-topic=" + "development" + checkniveau(niveau) + "]") );
		} else

		if ( $figure.is($(".send")) ) {
			console.log("plop");
			newComment( commentData, $figure );
		}

	});







});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVm9sdW1lcy9KdWRlMi9Vc2Vycy9sb3Vpcy9BQ1RJVkVfUFJPSkVDVFMvMTQwMDRfV0lLSS9QUk9EVUNUSU9OL0hUTUwvUFJPVE8tMS9ub2RlX21vZHVsZXMvcGhvLWRldnN0YWNrL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVm9sdW1lcy9KdWRlMi9Vc2Vycy9sb3Vpcy9BQ1RJVkVfUFJPSkVDVFMvMTQwMDRfV0lLSS9QUk9EVUNUSU9OL0hUTUwvUFJPVE8tMS9zcmMvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBuaXZlYXUgPSAwO1xuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuXHRyZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG52YXIgdG9jID0gJCgnLnJ1YnJpcXVlIC5jb2wzJyk7XG5cblxuLyoqKioqKiogb3JpZ2luZSA6IGpxdWVyeXVpLWVhc2luZyBzY3JpcHQsIEJTRCBsaWNlbnNlICAqKioqKiovXG5cbiQuZXh0ZW5kKCQuZWFzaW5nLFxue1xuICAgIGRlZjogJ2Vhc2VPdXRRdWFkJyxcbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcbiAgICAgICAgaWYgKCh0Lz1kLzIpIDwgMSkgcmV0dXJuIGMvMip0KnQqdCp0KnQgKyBiO1xuICAgICAgICByZXR1cm4gYy8yKigodC09MikqdCp0KnQqdCArIDIpICsgYjtcbiAgICB9XG5cbn0pO1xuLyogdW5pdmVyc2FsIGRlbGF5ZXIgZnJvbSBzdGFja292ZXJmbG93ICovXG52YXIgd2FpdEZvckZpbmFsRXZlbnQgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgdGltZXJzID0ge307XG4gIHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2ssIG1zLCB1bmlxdWVJZCkge1xuICAgIGlmICghdW5pcXVlSWQpIHtcbiAgICAgIHVuaXF1ZUlkID0gXCJEb24ndCBjYWxsIHRoaXMgdHdpY2Ugd2l0aG91dCBhIHVuaXF1ZUlkXCI7XG4gICAgfVxuICAgIGlmICh0aW1lcnNbdW5pcXVlSWRdKSB7XG4gICAgICBjbGVhclRpbWVvdXQgKHRpbWVyc1t1bmlxdWVJZF0pO1xuICAgIH1cbiAgICB0aW1lcnNbdW5pcXVlSWRdID0gc2V0VGltZW91dChjYWxsYmFjaywgbXMpO1xuICB9O1xufSkoKTtcblxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWRUZXh0KCkge1xuICAgIHZhciB0ZXh0ID0gXCJcIjtcbiAgICBpZiAodHlwZW9mIHdpbmRvdy5nZXRTZWxlY3Rpb24gIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0ZXh0ID0gd2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQuc2VsZWN0aW9uICE9IFwidW5kZWZpbmVkXCIgJiYgZG9jdW1lbnQuc2VsZWN0aW9uLnR5cGUgPT0gXCJUZXh0XCIpIHtcbiAgICAgICAgdGV4dCA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpLnRleHQ7XG4gICAgfVxuICAgIHJldHVybiB0ZXh0O1xufVxuXG5mdW5jdGlvbiBkb1NvbWV0aGluZ1dpdGhTZWxlY3RlZFRleHQoKSB7XG4gICAgdmFyIHNlbGVjdGVkVGV4dCA9IGdldFNlbGVjdGVkVGV4dCgpO1xuICAgIGlmIChzZWxlY3RlZFRleHQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJHb3Qgc2VsZWN0ZWQgdGV4dCBcIiArIHNlbGVjdGVkVGV4dCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBtb2RlQXBlcmN1ICgpIHtcblxuXHQkKFwiYm9keVwiKS5hZGRDbGFzcyhcImFwZXJjdVwiKTtcblx0JCgnLmNvbnRhaW5lcicpLmNzcyhcIndpZHRoXCIsIFwiMTAwdndcIik7XG5cdCQoXCIuY29sb25uZVwiKS5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRpZiAoICQodGhpcykuZGF0YSgnY29sJykgIT09IFwiXCIgKSB7XG5cdFx0XHQkdGhhdCA9ICQodGhpcyk7XG5cdFx0XHQkY29sb25uZXMgPSAkdGhhdC5maW5kKFwiLmNvbDNcIik7XG5cblx0XHRcdGNvbnNvbGUubG9nKCBcIiR0aGF0LmRhdGEoJ2NvbCcpXCIgKyAkdGhhdC5kYXRhKCdjb2wnKSApO1xuXG5cdFx0XHR2YXIgcnVicmlxdWVhbW9udHJlciA9ICRjb2xvbm5lcy5maWx0ZXIoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyggXCIkKHRoaXMpLmRhdGEoJ2dvdG9uaXZlYXUnKVwiICsgJCh0aGlzKS5kYXRhKCdnb3Rvbml2ZWF1JykgKTtcblx0XHRcdFx0cmV0dXJuICQodGhpcykuZGF0YSgnZ290b25pdmVhdScpLm1hdGNoKCAkdGhhdC5kYXRhKCdjb2wnKSApXG5cdFx0XHR9KTtcblxuXHRcdFx0JGNvbG9ubmVzLmFkZENsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0cnVicmlxdWVhbW9udHJlci5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBtb2RlQ29sb25uZSAoIG51bUNvbG9ubmVBTW9udHJlciApIHtcblxuXHQkKFwiYm9keVwiKS5yZW1vdmVDbGFzcyhcImFwZXJjdVwiKTtcblx0JChcIi5jb2wzXCIpLnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHQkKCcuY29udGFpbmVyJykuY3NzKFwid2lkdGhcIiwgXCIyOTB2d1wiKTtcblx0c2V0VGltZW91dChcdGZ1bmN0aW9uKCkge1xuXHRcdG1vdmVjb2woIG51bUNvbG9ubmVBTW9udHJlciApO1xuXHR9LCAxNDAwICk7XG5cbn1cblxuLy8gZ29nbyBjb2xvbm5lIGNsaXF1w6llc1xudmFyIG1vdmVjb2wgPSBmdW5jdGlvbiAoZ290b25pdmVhdSkge1xuXG5cdHZhciBuZXdDb2xvbm5lID0gJCgnLmNvbG9ubmVbZGF0YS1jb2w9JyArIGdvdG9uaXZlYXUgKyAnXScpO1xuXG5cdC8vIGwnb2JqZWN0aWYgZXN0IGRlIGNlbnRyZXIgc3VyIGxhIGNvbG9ubmVcblx0Ly8gaWwgZmF1dCBkb25jIHRyb3V2ZXIgbGUgc2Nyb2xsTGVmdCBxdWkgcHJlbmRyYSBlbiBjb21wdGUgbGEgbGFyZ2V1ciBkZSBsYSBmZW7DqnRyZSBldCBsYSBwb3NpdGlvbiBkdSBjZW50cmUsIHNvaXRcblx0dmFyIHBvc0NlbnRlckNvbCA9IG5ld0NvbG9ubmUucG9zaXRpb24oKS5sZWZ0ICsgKCQoJy5jb2xvbm5lW2RhdGEtY29sPScgKyBnb3Rvbml2ZWF1ICsgJ10nKS53aWR0aCgpIC8gMik7XG5cblx0dmFyIHNjcm9sbExlZnRWYWx1ZSA9ICQoJyNtYXNxdWUnKS5zY3JvbGxMZWZ0KCkgKyBwb3NDZW50ZXJDb2wgLSAkKHdpbmRvdykud2lkdGgoKSAvIDI7XG5cblx0Ly8gc2Nyb2xsTGVmdFZhbHVlIHBvdXIgc2Nyb2xsTGVmdC4gTWFpcyB0cmFuc2xhdGVYIGR1IGNvbnRhaW5lciBkYW5zIGxlIG1hc3F1ZSBlc3QgcGx1cyBmbHVpZGVcblx0Ly9jb25zb2xlLmxvZyggXCJzY3JvbGxMZWZ0VmFsdWUgOiBcIiArIHNjcm9sbExlZnRWYWx1ZSk7XG5cdC8vdmFyIHNjcm9sbExlZnRWYWx1ZSA9ICQoJyNtYXNxdWUnKS5zY3JvbGxMZWZ0KCkgKyAkKCcuY29sb25uZVtkYXRhLWNvbD0nICsgZ290b25pdmVhdSArICddJykub2Zmc2V0KCkubGVmdCAtIDAuMDUqJCh3aW5kb3cpLndpZHRoKCk7XG5cblx0Ly8gcG9zaXRpb24gZGUgbGEgY29sb25uZSBjb25jZXJuw6llIGRhbnMgbCdlc3BhY2Vcblx0dmFyIG1vdmVDb2xWYWx1ZSA9IHBvc0NlbnRlckNvbCAtICQod2luZG93KS53aWR0aCgpIC8gMjtcblxuXHQvLyBkw6lwbGFjZW1lbnQgZHUgY29udGFpbmVyIGF2ZWMgdW4gdHJhbnNsYXRlWFxuXHQkKCcjbWFzcXVlIC5jb250YWluZXInKS50cmFuc2l0aW9uKHtcblx0XHR4OiAtc2Nyb2xsTGVmdFZhbHVlLFxuXHRcdGR1cmF0aW9uIDogODAwLFxuXHRcdGVhc2luZzogXCJzbmFwXCIsXG5cdH0pO1xuXG5cdCQoXCIuY29sb25uZVwiKS5hZGRDbGFzcyhcInBlcmlwaGVyaWVcIik7XG5cdCQoJy5jb2xvbm5lW2RhdGEtY29sPScgKyBnb3Rvbml2ZWF1ICsgJ10nKS5yZW1vdmVDbGFzcyhcInBlcmlwaGVyaWVcIik7XG5cdCQoJ2JvZHknKS5yZW1vdmVDbGFzcyhcIm5pdmVhdTAgbml2ZWF1MSBuaXZlYXUyXCIpO1xuXHQkKCdib2R5JykuYWRkQ2xhc3MoZ290b25pdmVhdSk7XG5cbn07XG5cbnZhciBjaGVja25pdmVhdSA9IGZ1bmN0aW9uIChsZXZlbCkge1xuXHRsZXZlbCA9IGxldmVsIDwgMCA/IDAgOiBsZXZlbDtcblx0bGV2ZWwgPSBsZXZlbCA+IDIgPyAyIDogbGV2ZWw7XG5cdHJldHVybiBsZXZlbDtcbn1cblxuXG5cbi8vIHJlY29uc3RydWN0aW9uIGRlcyBjb21tZW50YWlyZXNcbmZ1bmN0aW9uIHJlY29uc3RydWN0Q29tbWVudGFpcmVzICggY29tbWVudERhdGEgKSB7XG5cblx0Y29uc29sZS5sb2coXCJjb21tZW50RGF0YS5sZW5ndGggOiBcIiArIGNvbW1lbnREYXRhLmxlbmd0aCk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb21tZW50RGF0YS5sZW5ndGg7IGkrKykge1xuXG5cdFx0dmFyIGNvbW1lbnRzID0gY29tbWVudERhdGFbaV07XG5cdFx0Y29uc29sZS5sb2coIFwiY29tbWVudHNcIiwgY29tbWVudHMpO1xuXG5cdFx0dmFyIGlkID0gY29tbWVudHMuaWQ7XG5cdFx0dmFyIGF1dGV1ciA9IGNvbW1lbnRzLm5vbS50b1N0cmluZygpO1xuXHRcdHZhciB0ZXh0ZSA9IGNvbW1lbnRzLnRleHRlLnRvU3RyaW5nKCk7XG5cdFx0dmFyIGRpZmZpY3VsdGUgPSBjb21tZW50cy5wb3NpdGlvblswXS5kaWZmO1xuXHRcdHZhciBwYXJhZ3JhcGhlID0gY29tbWVudHMucG9zaXRpb25bMF0ucGFyYTtcblxuXHRcdHZhciBjb21tZW50RmllbGQgPSAkKCcuY29sb25uZVtkYXRhLWNvbD0nICsgZGlmZmljdWx0ZSArICddJykuZmluZCggJy5ibG9jdGV4dFtkYXRhLXBhcmE9XCInICsgcGFyYWdyYXBoZSArICdcIl0gLmNvbW1lbnRzJyApO1xuXG5cdFx0dmFyIGNvbnN0cnVjdGlvbkNvbW1lbnRhaXJlID0gJzxkaXYgY2xhc3M9XCJjb21tZW50YWlyZVwiIGRhdGEtaWQ9XCInICsgaWQgKyAnXCIgZGF0YS1hdXRldXI9XCInICsgYXV0ZXVyICsgJ1wiPjxkaXYgY2xhc3M9XCJhdXRldXJcIj4nICsgYXV0ZXVyICsgJzwvZGl2PjxkaXYgY2xhc3M9XCJ0ZXh0ZVwiPicgKyB0ZXh0ZSArICc8L2Rpdj48L2Rpdj4nO1xuXG5cdFx0Y29uc29sZS5sb2coIFwiJWMgY29uc3RydWN0aW9uQ29tbWVudGFpcmUgOiBcIiArIGNvbnN0cnVjdGlvbkNvbW1lbnRhaXJlLCAnYmFja2dyb3VuZDogI2VlZTsgY29sb3I6ICMwOTYwNkYnKTtcblxuXHRcdGNvbnNvbGUubG9nKCBcImNvbW1lbnRGaWVsZCA6IFwiLCBjb21tZW50RmllbGQpO1xuXG5cdFx0Ly8gcmVnYXJkZXIgc2kgaWwgZXhpc3RlIGTDqWrDoFxuXHRcdGlmICggY29tbWVudEZpZWxkLmZpbmQoXCIuY29tbWVudGFpcmVbZGF0YS1pZD1cIiArIGNvbW1lbnRzLmlkICsgXCJdXCIpLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdGNvbW1lbnRGaWVsZC5maW5kKFwiLnN1Ym1pdFwiKS5iZWZvcmUoIGNvbnN0cnVjdGlvbkNvbW1lbnRhaXJlICk7XG5cdFx0fVxuXG5cdH1cblxuXHQvL2NvbnNvbGUubG9nKFwiZGF0YUFycmF5XCIpO1xuXHQvL2NvbnNvbGUubG9nKGRhdGFBcnJheSk7XG5cblxufVxuXG4vLyBhZGQgY29tbWVudFxuZnVuY3Rpb24gbmV3Q29tbWVudCggY29tbWVudERhdGEsICR0aGlzICkge1xuXG5cdHZhciBuZXdJZCA9IGNvbW1lbnREYXRhLmxlbmd0aDtcblx0dmFyIGRpZmZpY3VsdGUgPSAkdGhpcy5wYXJlbnRzKFwiLmNvbG9ubmVcIikuZGF0YShcImNvbFwiKTtcblx0dmFyIHBhcmFncmFwaGUgPSAkdGhpcy5wYXJlbnRzKFwiLmJsb2N0ZXh0XCIpLmRhdGEoXCJwYXJhXCIpO1xuXHR2YXIgbm9tID0gJHRoaXMuc2libGluZ3MoKS5jbG9zZXN0KFwiLm5vbVwiKS52YWwoKTtcblx0dmFyIHRleHRlID0gJHRoaXMuc2libGluZ3MoKS5jbG9zZXN0KFwiLnRleHRlXCIpLnZhbCgpO1xuXG5cdGNvbW1lbnREYXRhW2NvbW1lbnREYXRhLmxlbmd0aF0gPSB7IFwiaWRcIiA6IG5ld0lkLCBcIm5vbVwiOiBub20sIFwidGV4dGVcIjogdGV4dGUsXHRcInBvc2l0aW9uXCI6IFt7IFwiZGlmZlwiOiBkaWZmaWN1bHRlLCBcInBhcmFcIjogcGFyYWdyYXBoZSB9XVxuIH07XG4gXHR1cGRhdGVKU09OICggY29tbWVudERhdGEsIG9yaWdpbkpzb24pO1xuXG59XG5cbmZ1bmN0aW9uIHBvcHVwUHJvbXB0IChpbnN0cnVjdGlvbnMsIHByZXZWYWx1ZSkge1xuICAgIHZhciB4O1xuICAgIHZhciBuYW1lID0gcHJvbXB0KCBpbnN0cnVjdGlvbnMsXCJcIik7XG4gICAgaWYgKCBuYW1lICE9IFwiXCIgJiYgbmFtZSAhPSBudWxsKSB7XG5cdFx0cmV0dXJuIG5hbWU7XG5cdH1cblx0cmV0dXJuIHByZXZWYWx1ZTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlSlNPTiAoIGNvbW1lbnREYXRhLCBvcmlnaW5Kc29uKSB7XG5cblx0Y29uc29sZS5sb2coXCJ1cGRhdGVKU09OXCIpO1xuXHRjb25zb2xlLmxvZyggb3JpZ2luSnNvbiApO1xuXHRjb25zb2xlLmxvZyggY29tbWVudERhdGEgKTtcblx0Ly92YXIgSlNPTmRhdGFUb1dyaXRlID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG5cblx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cblx0XHQkLmFqYXgoe1xuXHRcdCAgICB1cmw6ICd1cGRhdGUucGhwJyxcblx0XHQgICAgdHlwZTogXCJQT1NUXCIsXG5cdFx0ICAgIGRhdGE6IHsgcGF0aDogb3JpZ2luSnNvbiwgZGF0YTogY29tbWVudERhdGEgfSxcblx0XHQgICAgdGltZW91dDogMjAwMCxcblx0XHQgICAgc3VjY2VzczogIGZ1bmN0aW9uKG91dHB1dCkge1xuXHRcdCAgICAgICAgY29uc29sZS5sb2cob3V0cHV0KTtcblx0XHRcdFx0cmVjb25zdHJ1Y3RDb21tZW50YWlyZXMoY29tbWVudERhdGEpO1xuXHRcdCAgICB9LFxuXHRcdCAgICBlcnJvcjogZnVuY3Rpb24ob3V0cHV0KSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiZXJyb3IgOiBcIiArIG91dHB1dCk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKG91dHB1dCk7XG5cdFx0ICAgIH1cblx0XHR9KTtcblx0fSwgMjAwKTtcblxufVxuXG5cblxuXG5cblxuJChkb2N1bWVudCkucmVhZHkoIGZ1bmN0aW9uKCkge1xuXG5cdCQoJyN0b29sYmFyJykuY3NzKFwib3BhY2l0eVwiLCAxKTtcblx0JCgnLmNvbnRhaW5lcicpLmNzcyhcIm9wYWNpdHlcIiwgMSk7XG5cblx0bW9kZUFwZXJjdSAoKTtcblxuXHQvLyBzaSBjbGlxdWUgc3VyIHRpdHJlIChpZCBkZSBsJ8OpbMOpbWVudCDDoCBzY3JvbGxlcilcblx0dmFyIG1vdmV0aXRyZSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuXHRcdC8vIHNjcm9sbCBkdSBoYXV0XG5cdFx0JCgnI21hc3F1ZScpLmFuaW1hdGUoe1xuXHRcdFx0c2Nyb2xsVG9wOiAkKCcjbWFzcXVlJykuc2Nyb2xsVG9wKCkgKyBzZWxlY3Rvci5vZmZzZXQoKS50b3AgLSA4MFxuXHRcdH0sIHsgZHVyYXRpb246IDgwMCwgcXVldWU6IGZhbHNlIH0pO1xuXHR9O1xuXG5cdC8vIGJvcmR1cmUgZGUgbmF2aWdhdGlvbiBkYW5zIGxhIGNvbG9ubmVcblx0e1xuXHRcdCQoXCIuY29sb25uZVwiKS5lYWNoKCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgY291bnRlciA9IDA7XG5cdFx0XHQkKHRoaXMpLmZpbmQoJ3AsIGg0JykuZWFjaCggZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb3VudGVyICs9IDE7XG5cdFx0XHRcdCQodGhpcykud3JhcCgnPGRpdiBjbGFzcz1cImJsb2N0ZXh0XCIgZGF0YS1wYXJhPVwiJyArIGNvdW50ZXIgKyAnXCI+PC9kaXY+Jyk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIGJvcmR1cmUgZ2F1Y2hlLWRyb2l0ZVxuXHRcdCQoJzxkaXYgY2xhc3M9XCJib3JkZXIgYm9yZGVyLWxlZnRcIj48L2Rpdj48ZGl2IGNsYXNzPVwiYm9yZGVyIGJvcmRlci1yaWdodFwiPjwvZGl2PicpLmluc2VydEFmdGVyKCcuY29sb25uZSBwLCAuY29sb25uZSBoNCcpO1xuXHRcdC8vIGljb25lIGEgY290ZSBkdSB0aXRyZVxuLyogXHRcdCQoJzxkaXYgY2xhc3M9XCJnZW5lXCI+PGltZyBzcmM9XCJpbWcvZ2VuZWFsb2d5LnN2Z1wiIGFsdD1cImdseXBoaWNvbnNfMDA4X2ZpbG1cIiB3aWR0aD1cIlwiIGhlaWdodD1cIlwiIC8+PC9kaXY+JykuaW5zZXJ0QmVmb3JlKCcuaW5zaWRlIGgxJyk7ICovXG5cdFx0Ly8gaWNvbmUgZGFucyB0b29sYmFyXG5cdFx0JCgnI3RpdHJlYXJ0aWNsZScpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImdlbmVcIj48aW1nIHNyYz1cImltYWdlcy9nZW5lYWxvZ3kuc3ZnXCIgYWx0PVwiZ2x5cGhpY29uc18wMDhfZmlsbVwiIHdpZHRoPVwiXCIgaGVpZ2h0PVwiXCIgLz48L2Rpdj4nKTtcblx0XHQvLyBham91dGVyIGxlcyBjaGFtcHMgZGUgY29tbWVudGFpcmVcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29tbWVudHNcIj48ZGl2IGNsYXNzPVwic3VibWl0XCI+PGg1PkNvbW1lbnRzPC9oNT48dGV4dGFyZWEgY2xhc3M9XCJub21cIj48L3RleHRhcmVhPjx0ZXh0YXJlYSBjbGFzcz1cInRleHRlXCI+PC90ZXh0YXJlYT48YnV0dG9uIGNsYXNzPVwic2VuZFwiPjwvYnV0dG9uPjwvZGl2PjwvZGl2PicpLmluc2VydEFmdGVyKCcuY29sb25uZSBwLCAuY29sb25uZSBoNCcpO1xuXHR9XG5cblxuXHQvLyB0aXRyZSBcImRpZmZpY3VsdMOpIGVuIGhhdXQgZGUgbGEgY29sb25uZVxuXHR7XG5cdFx0JChcIi5jb2xvbm5lXCIpLmVhY2goIGZ1bmN0aW9uICgpIHtcblx0XHRcdCR0aGlzID0gJCh0aGlzKTtcblx0XHRcdHZhciBuaXZlYXVOID0gJHRoaXMuZGF0YShcImNvbFwiKTtcblx0XHRcdHZhciBkaWZmaWN1bHRlID0gJHRoaXMuZmluZChcIi5jb2wzW2RhdGEtZ290b25pdmVhdT1cIiArIG5pdmVhdU4gKyBcIl1cIikuZmluZChcImg1LnRpdHJlY29sXCIpLnRleHQoKTtcblx0XHRcdCR0aGlzLmZpbmQoXCIuaW5zaWRlXCIpLmJlZm9yZShcIjxoNSBjbGFzcz0ndGl0cmVUb3BDb2wgKyBcIiArIG5pdmVhdU4gKyBcIic+XCIgKyBkaWZmaWN1bHRlICsgXCI8L2g1PlwiKTtcblx0XHR9KTtcblxuXG5cblx0fVxuXG5cdC8vIGNyw6lhdGlvbiBkZSBydWJyaXF1ZXNcblx0e1xuXHRcdHZhciBjb3VudGVyID0gMDtcblx0XHQkKCcuY29sb25uZS5zaW1wbGUgaDInKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJlZmNvdW50ZXIgPSAnc2ltcGxlJytjb3VudGVyKys7XG5cdFx0XHQkKHRoaXMpLmF0dHIoJ2lkJywgcmVmY291bnRlcik7XG5cdFx0XHQkKCcucnVicmlxdWUgLnNpbXBsZSBvbCcpLmFwcGVuZCgnPGxpPjxoNSBkYXRhLWdvdG89XCInK3JlZmNvdW50ZXIrJ1wiPicrJCh0aGlzKS50ZXh0KCkrJzwvaDU+PC9saT4nKTtcblx0XHR9KTtcblx0XHRjb3VudGVyID0gMDtcblx0XHQkKCcuY29sb25uZS5tb3llbiBoMicpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcmVmY291bnRlciA9ICdtb3llbicrY291bnRlcisrO1xuXHRcdFx0JCh0aGlzKS5hdHRyKCdpZCcsIHJlZmNvdW50ZXIpO1xuXHRcdFx0JCgnLnJ1YnJpcXVlIC5tb3llbiBvbCcpLmFwcGVuZCgnPGxpPjxoNSBkYXRhLWdvdG89XCInK3JlZmNvdW50ZXIrJ1wiPicrJCh0aGlzKS50ZXh0KCkrJzwvaDU+PC9saT4nKTtcblx0XHR9KTtcblx0XHRjb3VudGVyID0gMDtcblx0XHQkKCcuY29sb25uZS5jb21wbGV4IGgyJykuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdHZhciByZWZjb3VudGVyID0gJ2NvbXBsZXgnK2NvdW50ZXIrKztcblx0XHRcdCQodGhpcykuYXR0cignaWQnLCByZWZjb3VudGVyKTtcblx0XHRcdCQoJy5ydWJyaXF1ZSAuY29tcGxleCBvbCcpLmFwcGVuZCgnPGxpPjxoNSBkYXRhLWdvdG89XCInK3JlZmNvdW50ZXIrJ1wiPicrJCh0aGlzKS50ZXh0KCkrJzwvaDU+PC9saT4nKTtcblx0XHR9KTtcblx0fVxuXG5cblx0Ly8gw6l0YXQgXCJmYXJcIiBkdSBibG9jayBkdSBoYXV0XG5cdHtcblx0XHQkKCcjbWFzcXVlJykuYmluZChcInNjcm9sbFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgc2Nyb2xsZHVoYXV0ID0gJCgnI21hc3F1ZScpLnNjcm9sbFRvcCgpO1xuXHRcdFx0aWYgKCBzY3JvbGxkdWhhdXQgPCA4MCApIHtcblx0XHRcdFx0JCgnI3Rvb2xiYXInKS5yZW1vdmVDbGFzcyhcImZhclwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoJyN0b29sYmFyJykuYWRkQ2xhc3MoXCJmYXJcIik7XG5cdFx0XHR9XG5cdFx0XHQvL2FydGljbGVQcm9jaGUoc2NvbGxkdWhhdXQpO1xuXHRcdFx0Ly8kKCcudG9vbGJhci1mb25kJylcblx0XHR9KTtcblx0fVxuXG5cdC8vIGxvYWQgQ29tbWVudHNcblx0d2luZG93Lm9yaWdpbkpzb24gPSBcImNvbW1lbnRzLmpzb25cIjtcblxuXHQkLmdldEpTT04oIG9yaWdpbkpzb24sIGZ1bmN0aW9uKGRhdGEpIHtcblxuXHRcdGNvbnNvbGUubG9nKCBcImRhdGEgOiBcIiArIGRhdGEgKTtcblx0XHRjb25zb2xlLnRhYmxlKCBkYXRhICk7XG5cblx0XHR3aW5kb3cuY29tbWVudERhdGEgPSBkYXRhO1xuXG5cdFx0cmVjb25zdHJ1Y3RDb21tZW50YWlyZXMgKCBjb21tZW50RGF0YSApO1xuXG5cdH0pO1xuXG5cblxuXG5cblxuXHQkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCl7XG5cdCAgICB3YWl0Rm9yRmluYWxFdmVudChmdW5jdGlvbigpe1xuXHRcdFx0c2V0VGltZW91dChcdGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRtb3ZlY29sKCBuaXZlYXUgKTtcblx0XHRcdH0sIDE0MDAgKTtcblx0ICAgIH0sIDUwMCwgXCJyZXNpemVcIik7XG5cblx0fSk7XG5cblxuXG5cblx0LyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBjbGljayBldmVudHMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cdC8vIHNlbGVjdGVkIHRleHRcblx0ZG9jdW1lbnQub25tb3VzZXVwID0gZG9Tb21ldGhpbmdXaXRoU2VsZWN0ZWRUZXh0O1xuXHRkb2N1bWVudC5vbmtleXVwID0gZG9Tb21ldGhpbmdXaXRoU2VsZWN0ZWRUZXh0O1xuXG5cdCQoJ2JvZHknKS5jbGljayggZnVuY3Rpb24oZSkge1xuXG5cdFx0Ly8gY2xpY2sgc3VyIFdla2V5cGVkaWEgKGVuIGF0dGVuZGFudClcblx0XHR2YXIgJGZpZ3VyZSA9ICQoZS50YXJnZXQpO1xuXHRcdGNvbnNvbGUubG9nKCRmaWd1cmUpO1xuXG5cdFx0aWYgKCAkKFwiYm9keVwiKS5oYXNDbGFzcyhcImFwZXJjdVwiKSApIHtcblx0XHRcdHZhciBnZXRDb2wgPSAkZmlndXJlLmNsb3Nlc3QoXCIuY29sb25uZVwiKS5kYXRhKFwiY29sXCIpO1xuXHRcdFx0Y29uc29sZS5sb2coXCJnZXRDb2wgOiBcIiArIGdldENvbCk7XG5cdFx0XHRtb2RlQ29sb25uZSAoIGdldENvbCApO1xuXHRcdH0gZWxzZVxuXG5cdFx0aWYgKCAkZmlndXJlLmlzKCcjYmxvY2xvZ28gaDInKSApIHtcblx0XHRcdGNvbnNvbGUubG9nKFwicGxvcFwiKTtcblx0XHRcdG1vZGVDb2xvbm5lICggXCJuaXZlYXUwXCIgKTtcblx0XHR9IGVsc2VcblxuXHRcdC8vIGNsaWNrIGQndW5lIGNvbG9ubmUgZGUgcnVicmlxdWUgOiBjaGFuZ2VtZW50IGRlIGNvbFxuXHRcdGlmICggJGZpZ3VyZS5pcyhcIi5jb2wzPmg1XCIpICkge1xuXHRcdFx0Y29uc29sZS5sb2coXCIuY29sMz5oNVwiKTtcblx0XHRcdG1vdmVjb2woICRmaWd1cmUuY2xvc2VzdChcIi5jb2wzXCIpLmRhdGEoXCJnb3Rvbml2ZWF1XCIpICk7XG5cdFx0fSBlbHNlXG5cblx0XHQvLyBjbGljayBzdXIgw6lsw6ltZW50IGQndW5lIHJ1YnJpcXVlXG5cdFx0aWYgKCAkZmlndXJlLmlzKCQoJy5ydWJyaXF1ZSBvbCBoNScpKSApIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiLnJ1YnJpcXVlIG9sIGg1XCIpO1xuXHRcdFx0aWYgKCAhJChcImJvZHlcIikuaGFzQ2xhc3MoXCJhcGVyY3VcIikgKSB7XG5cdFx0XHRcdG1vdmVjb2woICRmaWd1cmUuY2xvc2VzdChcIi5jb2wzXCIpLmRhdGEoXCJnb3Rvbml2ZWF1XCIpICk7XG5cdFx0XHR9XG5cdFx0XHRtb3ZldGl0cmUoICQoXCIuY29sb25uZSBoMltpZD1cIiArICRmaWd1cmUuZGF0YShcImdvdG9cIikgKyBcIl1cIikgKTtcblx0XHR9IGVsc2VcblxuXHRcdC8vIGF1IGNsaWNrIHN1ciBsZXMgYm9yZHVyZXNcblx0XHRpZiAoICRmaWd1cmUuaXMoJChcIi5ib3JkZXItcmlnaHRcIikpICkge1xuXHRcdFx0bml2ZWF1ICs9IDE7XG5cdFx0XHRtb3ZlY29sKCBcIm5pdmVhdVwiICsgY2hlY2tuaXZlYXUobml2ZWF1KSApO1xuXHRcdFx0bW92ZXRpdHJlKCAkKFwiaDJbZGF0YS10b3BpYz1cIiArIFwiZGV2ZWxvcG1lbnRcIiArIGNoZWNrbml2ZWF1KG5pdmVhdSkgKyBcIl1cIikgKTtcblx0XHR9IGVsc2VcblxuXHRcdGlmICggJGZpZ3VyZS5pcygkKFwiLmJvcmRlci1sZWZ0XCIpKSApIHtcblx0XHRcdG5pdmVhdSAtPSAxO1xuXHRcdFx0bW92ZWNvbCggXCJuaXZlYXVcIiArIGNoZWNrbml2ZWF1KG5pdmVhdSkgKTtcblx0XHRcdG1vdmV0aXRyZSggJChcImgyW2RhdGEtdG9waWM9XCIgKyBcImRldmVsb3BtZW50XCIgKyBjaGVja25pdmVhdShuaXZlYXUpICsgXCJdXCIpICk7XG5cdFx0fSBlbHNlXG5cblx0XHRpZiAoICRmaWd1cmUuaXMoJChcIi5zZW5kXCIpKSApIHtcblx0XHRcdGNvbnNvbGUubG9nKFwicGxvcFwiKTtcblx0XHRcdG5ld0NvbW1lbnQoIGNvbW1lbnREYXRhLCAkZmlndXJlICk7XG5cdFx0fVxuXG5cdH0pO1xuXG5cblxuXG5cblxuXG59KTsiXX0=
