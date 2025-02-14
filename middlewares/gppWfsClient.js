const GeoportalWfsClient = require('geoportal-wfs-client');

/*
 * Middleware pour la création du client WFS geoportail
 * 
 * TODO permettre la définition de la clé au niveau du serveur
 */
module.exports = function(req, res, next) {
    /* gestion des variables d'environnement et valeur par défaut */
    var options = {
        apiKey:  process.env.GEOPORTAL_API_KEY,
        url: 'https://wxs.ign.fr/{apiKey}/geoportail/wfs',
        headers:{
            'User-Agent': 'apicarto',
            'Referer': 'http://localhost'
        }
    };

    /* gestion paramètre apikey */
    var hasUserKey = false;
    if ( req.body.apikey ){
        options.apiKey = req.body.apikey ;
        hasUserKey = true;
    }else if ( req.query.apikey ){
        options.apiKey = req.query.apikey ;
        hasUserKey = true;
    }

    /* gestion du paramètre Referer */
    if ( req.headers.referer ){
        options.headers.Referer = req.headers.referer ;
    }
    if ( process.env.GEOPORTAL_REFERER && ! hasUserKey ){
        options.headers.Referer = process.env.GEOPORTAL_REFERER ;
    }

    /* contrôle définition apikey */
    if ( ! options.apiKey ) {
        return res.status(403).json({
            code: 403,
            message:'Le paramètre apikey est requis'
        });
    }

    req.gppWfsClient = new GeoportalWfsClient(options);

    next();
};
