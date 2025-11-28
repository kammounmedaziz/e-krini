import Promotion from '../models/Promotion.js';

// ===== CRUD Operations =====

// @desc    Créer une nouvelle promotion
// @route   POST /api/promotions
// @access  Private/Admin
export const createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Promotion créée avec succès',
      data: promotion,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtenir toutes les promotions
// @route   GET /api/promotions
// @access  Public
export const getAllPromotions = async (req, res) => {
  try {
    const { actif, type, categorie_voiture, page = 1, limit = 10 } = req.query;

    const query = {};
    if (actif !== undefined) query.actif = actif === 'true';
    if (type) query.type = type;
    if (categorie_voiture) query.categorie_voiture = categorie_voiture;

    const promotions = await Promotion.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Promotion.countDocuments(query);

    res.status(200).json({
      success: true,
      data: promotions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtenir une promotion par ID
// @route   GET /api/promotions/:id
// @access  Public
export const getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mettre à jour une promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
export const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promotion mise à jour avec succès',
      data: promotion,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Supprimer une promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promotion supprimée avec succès',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== Business Logic Operations =====

// @desc    Obtenir les promotions actives
// @route   GET /api/promotions/active
// @access  Public
export const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();

    const promotions = await Promotion.find({
      actif: true,
      date_debut: { $lte: now },
      date_fin: { $gte: now },
    }).sort({ value: -1 });

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtenir les promotions applicables à une voiture
// @route   POST /api/promotions/applicable
// @access  Public
export const getApplicablePromotions = async (req, res) => {
  try {
    const { voiture } = req.body;

    if (!voiture || !voiture.id) {
      return res.status(400).json({
        success: false,
        message: 'Les informations de la voiture sont requises',
      });
    }

    const promotions = await Promotion.findApplicablePromotions(voiture);

    // Filtrer par jour spécifique si nécessaire
    const applicablePromotions = promotions.filter((promo) =>
      promo.appliesTo(voiture)
    );

    res.status(200).json({
      success: true,
      count: applicablePromotions.length,
      data: applicablePromotions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Calculer le prix avec promotion
// @route   POST /api/promotions/calculate
// @access  Public
export const calculatePromotionPrice = async (req, res) => {
  try {
    const { promotionId, amount, voiture } = req.body;

    if (!promotionId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de la promotion et le montant sont requis',
      });
    }

    const promotion = await Promotion.findById(promotionId);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion non trouvée',
      });
    }

    // Vérifier si la promotion s'applique à la voiture
    if (voiture && !promotion.appliesTo(voiture)) {
      return res.status(400).json({
        success: false,
        message: 'Cette promotion ne s\'applique pas à cette voiture',
      });
    }

    // Calculer la réduction
    const discount = promotion.applyDiscount(parseFloat(amount));

    res.status(200).json({
      success: true,
      data: discount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtenir les promotions par catégorie
// @route   GET /api/promotions/category/:category
// @access  Public
export const getPromotionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const now = new Date();

    const promotions = await Promotion.find({
      actif: true,
      date_debut: { $lte: now },
      date_fin: { $gte: now },
      categorie_voiture: category,
    });

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtenir la meilleure promotion pour une voiture
// @route   POST /api/promotions/best
// @access  Public
export const getBestPromotion = async (req, res) => {
  try {
    const { voiture, amount } = req.body;

    if (!voiture || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Les informations de la voiture et le montant sont requis',
      });
    }

    const promotions = await Promotion.findApplicablePromotions(voiture);

    let bestPromotion = null;
    let maxDiscount = 0;

    // Trouver la promotion qui offre la plus grande réduction
    for (const promo of promotions) {
      if (promo.appliesTo(voiture)) {
        const discount = promo.applyDiscount(parseFloat(amount));
        if (discount.reduction > maxDiscount) {
          maxDiscount = discount.reduction;
          bestPromotion = {
            promotion: promo,
            discount,
          };
        }
      }
    }

    if (!bestPromotion) {
      return res.status(404).json({
        success: false,
        message: 'Aucune promotion applicable trouvée',
      });
    }

    res.status(200).json({
      success: true,
      data: bestPromotion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Activer/Désactiver une promotion
// @route   PATCH /api/promotions/:id/toggle
// @access  Private/Admin
export const togglePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion non trouvée',
      });
    }

    promotion.actif = !promotion.actif;
    await promotion.save();

    res.status(200).json({
      success: true,
      message: `Promotion ${promotion.actif ? 'activée' : 'désactivée'} avec succès`,
      data: promotion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};